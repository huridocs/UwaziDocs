import { useEffect } from 'react';
import { matchPath } from 'react-router';
import { routes } from 'app/appRoutes';

const LibraryState = (emptyState) => {

    const findMatchingRoute = (pathname, routes, parentPath = '') => {
        for (const route of routes) {
            const currentPath = `${parentPath}/${route.path || ''}`.replace('//', '/');
            const match = matchPath({ path: currentPath, end: false }, pathname);
            if (match) {
                if (route.children) {
                    const childMatch = findMatchingRoute(pathname, route.children, currentPath);
                    if (childMatch) return childMatch;
                } else if (route.handle?.library) {
                    return route;
                }
            }
        }
        return null;
    };

    useEffect(() => {
        return () => {
            const nextLocation = window?.location?.pathname;
            const matchedRoute = findMatchingRoute(nextLocation, routes);
            if (matchedRoute && !nextLocation.includes('library')) {
                emptyState();
            }
        };
    }, [emptyState]);

    return null;
};

export { LibraryState };
