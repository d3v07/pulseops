export type TopBarFilterMap = Record<string, string>;

export function parseTopBarFilters(filters: string[]): TopBarFilterMap {
  const mapped: TopBarFilterMap = {};
  filters.forEach((filter) => {
    if (filter.startsWith('Segment:')) {
      mapped.segment = filter.replace('Segment:', '').trim();
    }
    if (filter.startsWith('Region:')) {
      mapped.region = filter.replace('Region:', '').trim();
    }
    if (filter.startsWith('Device:')) {
      mapped.device = filter.replace('Device:', '').trim();
    }
    if (filter.startsWith('Product:')) {
      mapped.product = filter.replace('Product:', '').trim();
    }
  });
  return mapped;
}
