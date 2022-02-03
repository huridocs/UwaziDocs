import { SearchQuery } from 'shared/types/SearchQueryType';
import { ElasticHit, SearchResponse } from 'api/search/elasticTypes';
import { EntitySchema } from 'shared/types/entityType';

function getSnippetsForMetadata(hit: ElasticHit<EntitySchema>) {
  // metadata: [
  //     {
  //         field: 'title',
  //         texts: [matches],
  //     },
  // ],
  return [{ field: 'title', texts: hit.highlight.title }];
}

function extractFullTextSnippets(hit: ElasticHit<EntitySchema>) {
  const fullTextSnippets: { text: string; page: number }[] = [];

  if (hit.inner_hits && hit.inner_hits.fullText.hits.hits.length > 0) {
    const { highlight } = hit.inner_hits.fullText.hits.hits[0];
    const regex = /\[{2}(\d+)]{2}/g;

    Object.values<string[]>(highlight).forEach(snippets => {
      snippets.forEach(snippet => {
        const matches = regex.exec(snippet);
        fullTextSnippets.push({
          text: snippet.replace(regex, ''),
          page: matches ? Number(matches[1]) : 0,
        });
      });
    });
  }
  return {
    count: fullTextSnippets.length + hit.highlight.title.length,
    metadata: getSnippetsForMetadata(hit),
    fullText: fullTextSnippets,
  };
}

export const mapResults = (entityResults: SearchResponse<EntitySchema>, searchQuery: SearchQuery) =>
  entityResults.hits.hits.map(entityResult => {
    const entity = entityResult._source;
    entity._id = entityResult._id;
    if (searchQuery.fields && searchQuery.fields.includes('snippets')) {
      entity.snippets = extractFullTextSnippets(entityResult);
    }
    return entity;
  });
