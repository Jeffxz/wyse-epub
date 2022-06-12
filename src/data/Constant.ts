export const EPUB_EXT = '.epub'
export const ZIP_EXT = '.zip'
export const MIMETYPE_FILE = 'mimetype'
export const METAINF_FOLDER = 'META-INF'
export const CONTAINER_XML_FILE = 'container.xml'
export const CONTAINER_XML_PLACEHOLDER = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
  <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml" />
</rootfiles>
</container>`
export const WYSEBEE_OPF = 'wysebee.opf'
export const INDEX_HTML = 'index.html'
export const WYSE_FOLDER = 'wyse'
export const WYSE_NAV_XHTML = 'nav.xhtml'
export const WYSE_NAV_ID = 'wyse_nav'
export const NAV_XHTML_PLACEHOLDER = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
  <head>
    <title>TODO: Concise test title</title>
  </head>
  <body>
    <nav epub:type="toc">
      <ol>
        <li><a href="content_001.xhtml">Link to main page</a></li>
      </ol>
    </nav>
  </body>
</html>`
export const WYSE_FALLBACK_XHTML = 'fallback.xhtml'
export const WYSE_FALLBACK_ID = 'wyse_fallback'
export const BOOK_ID = 'bookid'
export const WYSE_CONTENT_FILE = 'content_001.xhtml'
export const WYSE_CONTENT_PLACEHOLDER = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
  <head>
    <title>Content Title</title>
  </head>
  <body>
    <main>Content Body</main>
  </body>
</html>`
