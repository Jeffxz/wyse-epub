import * as spawn from 'cross-spawn'

const pdftoimage = (pdfFile: string, outputFolder: string, prefix: string, done?: (folder: string) => void) => {
    const option = [pdfFile, outputFolder + '/' + prefix, '-jpeg'];
    const pdf2ppm = spawn('pdftoppm', option, { stdio: 'inherit' });
    pdf2ppm.on('close', () => {
        if (done) {
            done(outputFolder)
        }
    });
    pdf2ppm.on('error', (e) => {
        console.error(e)
    });
}

export default pdftoimage