type WyseManifest = {
  name: string,
  version: string,
  description: string,
  entry: string,
  viewport: {
    width: number,
    height: number
  },
  author: string,
  copyright: string
}

function manifestPlaceholder(): WyseManifest {
  return {
    name: '',
    version: '0.0.1',
    description: '',
    entry: '',
    viewport: {
      width: 800,
      height: 600
    },
    author: '',
    copyright: 'free'
  } as WyseManifest
}

export { WyseManifest, manifestPlaceholder }
