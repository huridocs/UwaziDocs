/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


/** Type helpers */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type OneOf<T extends any[]> = T extends [infer Only] ? Only : T extends [infer A, infer B, ...infer Rest] ? OneOf<[XOR<A, B>, ...Rest]> : never;

export interface paths {
  "/api/v2/search": {
    /**
     * Search entities 
     * @description Search entities
     */
    get: {
      /**
       * Search entities 
       * @description Search entities
       */
      parameters: {
        query?: {
          page?: {
            limit?: number;
            offset?: number;
          };
          filter?: {
            searchString?: string;
            sharedId?: string;
            published?: boolean;
            [key: string]: ({
              from?: number;
              to?: number;
            } | ({
              values?: (string)[];
              /** @enum {string} */
              operator?: "AND" | "OR";
            }) | string | number | boolean) | undefined;
          };
          sort?: string;
          fields?: (string)[];
        };
        path: {
          id: string;
        };
      };
      responses: {
        /** @description A JSON array of entities */
        200: {
          content: {
            "application/json": {
              data?: ({
                  _id?: string | Record<string, never>;
                  sharedId?: string;
                  language?: string;
                  mongoLanguage?: string;
                  title?: string;
                  template?: string | Record<string, never>;
                  published?: boolean;
                  generatedToc?: boolean;
                  icon?: {
                    _id?: string | null;
                    label?: string;
                    type?: string;
                  };
                  creationDate?: number;
                  user?: string | Record<string, never>;
                  metadata?: {
                    [key: string]: (({
                        value: OneOf<[null, string, number, boolean, {
                          label?: string | null;
                          url?: string | null;
                        }, {
                          from?: number | null;
                          to?: number | null;
                        }, {
                          label?: string;
                          lat: number;
                          lon: number;
                        }, ({
                            label?: string;
                            lat: number;
                            lon: number;
                          })[]]>;
                        attachment?: number;
                        label?: string;
                        suggestion_confidence?: number;
                        suggestion_model?: string;
                        /** @enum {string} */
                        provenance?: "" | "BULK_ACCEPT";
                        inheritedValue?: ({
                            value: OneOf<[null, string, number, boolean, {
                              label?: string | null;
                              url?: string | null;
                            }, {
                              from?: number | null;
                              to?: number | null;
                            }, {
                              label?: string;
                              lat: number;
                              lon: number;
                            }, ({
                                label?: string;
                                lat: number;
                                lon: number;
                              })[]]>;
                            label?: string;
                          })[];
                        inheritedType?: string;
                      })[]) | undefined;
                  };
                  suggestedMetadata?: {
                    [key: string]: (({
                        value: OneOf<[null, string, number, boolean, {
                          label?: string | null;
                          url?: string | null;
                        }, {
                          from?: number | null;
                          to?: number | null;
                        }, {
                          label?: string;
                          lat: number;
                          lon: number;
                        }, ({
                            label?: string;
                            lat: number;
                            lon: number;
                          })[]]>;
                        attachment?: number;
                        label?: string;
                        suggestion_confidence?: number;
                        suggestion_model?: string;
                        /** @enum {string} */
                        provenance?: "" | "BULK_ACCEPT";
                        inheritedValue?: ({
                            value: OneOf<[null, string, number, boolean, {
                              label?: string | null;
                              url?: string | null;
                            }, {
                              from?: number | null;
                              to?: number | null;
                            }, {
                              label?: string;
                              lat: number;
                              lon: number;
                            }, ({
                                label?: string;
                                lat: number;
                                lon: number;
                              })[]]>;
                            label?: string;
                          })[];
                        inheritedType?: string;
                      })[]) | undefined;
                  };
                  permissions?: ({
                      refId: string | Record<string, never>;
                      /** @enum {string} */
                      type: "user" | "group" | "public";
                      /** @enum {string} */
                      level: "read" | "write" | "mixed";
                    })[];
                })[];
            };
          };
        };
      };
    };
  };
}

export type components = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
