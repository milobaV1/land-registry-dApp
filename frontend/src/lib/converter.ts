export const getLanduseNumber = (landuse: string): number => {
    switch (landuse.toLowerCase()) {
      case 'residential': return 0
      case 'industrial': return 1
      default: return 0 
    }
  }