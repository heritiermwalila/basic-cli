import chalk from 'chalk'
import fs from 'fs'
import ncp from 'ncp'
import path from 'path'
import {promisify} from 'util'
import execa from 'execa'
import listr from 'listr'
import {projectInstall} from 'pkg-install'
import Listr from 'listr'

const access = promisify(fs.access)
const copy = promisify(ncp)


async function copyTemplateFiles(options){
    
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false
    })
}

async function initGit(options){
    const result = await execa('git', ['init'], {
        cwd: options.targetDirectory
    })

    if(result.failed){
        return Promise.reject(new Error('Failed to initialize git'))
    }

    return
}

export async function createProject(options){
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd()
    }

    
    const currentFileUrl = import.meta.url
    const templateDir = path.resolve(
            new URL(currentFileUrl).pathname,
            '../../templates',
            options.template.toLowerCase()
        )
        
    options.templateDirectory = templateDir

    try {
        await access(templateDir, fs.constants.R_OK)
    } catch (error) {
        console.log(error);
        process.exit(1)
    }

    const tasks = new Listr([
        {
            title: 'Copy projects files',
            task:()=>copyTemplateFiles(options)
        },
        {
            title: 'Initial Git',
            task:()=>initGit(options),
            enabled: () =>options.git
        },
        {
            title:' Install dependendies',
            task:()=>projectInstall({
                cwd: options.targetDirectory
            }),
            skip:()=>!options.runInstall ? 'Pass --install to automatically install' : undefined
        }
    ])

    await tasks.run()

    console.log('%s project ready', chalk.green.bold('Done'));

    return true
}