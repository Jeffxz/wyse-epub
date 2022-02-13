import * as chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import * as JSZip from 'jszip'
import { Container, Epub, Ocf, Package } from 'epub-object-ts'
import { ValidationReport } from './ValidationReport'
import * as appData from '../../package.json'
import { manifestPath } from '../packager/WyseManifest'

export interface ValidateOption {
  mode: 'strict' | 'loose'
}

const validate = (pathName: string, option: ValidateOption) => {
  let epub: Epub | null = null
  let ocf: Ocf | null = null
  let epubPackage: Package | null = null

  const report: ValidationReport = {
    validationToolVersion: appData.version,
    epubPath: pathName
}

  if (fs.lstatSync(pathName).isDirectory()) {
    console.log(chalk.green('validating epub folder...'))
    try {
      const ocfXmlString = fs.readFileSync(path.join(pathName, Ocf.containerPath), 'utf8')
      const container = Container.loadFromXML(ocfXmlString)
      if (container) {
        ocf = new Ocf(container)
      } else {
        throw new Error(
          `could not find epub container from path ${Ocf.containerPath}`
        )
      }
      const opfPath = ocf.container?.rootfiles[0].fullPath
      const opfXmlString = fs.readFileSync(path.join(pathName, opfPath), 'utf8')
      epubPackage = Package.loadFromXML(opfXmlString)
      if (epubPackage != null) {
        epub = new Epub(ocf, epubPackage)
      }
    } catch (error) {
      console.error(error)
    }
  } else {
    console.log(chalk.green('validating epub file...'))
    try {
      fs.readFile(pathName, (error, data) => {
        JSZip.loadAsync(data).then((zip) => {
          zip.files[Ocf.containerPath]
            .async('string')
            .then((xmlString) => {
              const container = Container.loadFromXML(xmlString)
              if (container) {
                ocf = new Ocf(container)
                return ocf
              } else {
                throw new Error(
                  `could not find epub container from path ${Ocf.containerPath}`
                )
                return null
              }
            })
            .then((ocf) => {
              if (ocf) {
                zip.files[ocf.container?.rootfiles[0].fullPath]
                  .async('string')
                  .then((xmlString) => {
                    epubPackage = Package.loadFromXML(xmlString)
                    if (epubPackage != null) {
                      epub = new Epub(ocf, epubPackage)
                    }
                  })
                  .catch((error) => {
                    throw error
                  })
              }
            })
            .catch((error) => {
              console.error(error)
            })
        })
      })
    } catch (error) {
      console.error(error)
    }
  }
  if (epubPackage) {
    console.log(chalk.green(`Found epub version ${epubPackage.version}`))
    report.epubVersion = epubPackage.version
    if (epub) {
      report.epub = epub
    }
  }
  const reportFilepath = path.join(process.cwd(), 'validation_report.json')
  fs.writeFileSync(
    reportFilepath,
    JSON.stringify(report, null, 2)
  )
}

export default validate
