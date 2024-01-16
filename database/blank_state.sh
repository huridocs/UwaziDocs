#!/bin/bash

[[ -f ".env" ]] && source ".env"

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

DB=${1:-${DATABASE_NAME:-uwazi_development}}
HOST=${2:-${DBHOST:-127.0.0.1}}
FORCE_FLAG=${3:-false}

create_database() {
    echo -e "\nCreate $DB database on $HOST"
}

delete_database() {
    echo -e "\nDelete $DB database on $HOST"
    
    mongosh --quiet -host $HOST $DB --eval "db.dropDatabase()"
    mongorestore -h $HOST blank_state/uwazi_development/ --db=$DB

    INDEX_NAME=$DB DATABASE_NAME=$DB yarn migrate
    INDEX_NAME=$DB DATABASE_NAME=$DB yarn reindex
}

echo -e "\nDB IS $DB"
echo -e "\nHOST IS $HOST"
echo -e "\nFORCE FLAG IS $FORCE_FLAG"

# mongo_indexof_db=$(mongosh --quiet -host $HOST --eval 'db.getMongo().getDBNames().indexOf("'$DB'")')
mongo_indexof_db="-1"

echo -e "\nResult db: $mongo_indexof_db"

if [ $mongo_indexof_db -ne "-1" ]; then
    echo -e "\n$DB already database exists. It will not be deleted."
    exit 2
else
    echo -e "\nMongoDB database does not exist"
    if [ $FORCE_FLAG == "true" ]; then
                echo -e "\nForce flag is true"
                delete_database
                create_database
        else
                echo -e "\nForce flag is false"
                create_database
        fi
    exit 0
fi
