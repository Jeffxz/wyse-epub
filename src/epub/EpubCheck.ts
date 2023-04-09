import * as spawn from 'cross-spawn'

const EpubCheck = (file: string) => {
    if (process.env.EPUB_CHECK_PATH_JAR) {
        const option = ['-jar', process.env.EPUB_CHECK_PATH_JAR, file];
        const java = spawn('java', option, { stdio: 'inherit' });
    }
}

export default EpubCheck
