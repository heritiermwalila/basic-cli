import arg from 'arg'
import inquirer from 'inquirer'

import {createProject} from './main'

function parseArgIntoOptions(rawArgs)
{
    const args = arg(
        {
            '--git': Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '-g': '--git',
            '-y': '--yes',
            '-i': '--install'
        },
        {
            argv: rawArgs.slice(2)
        }
    )

    return {
        skipPrompts: args['--yes'] || false,
        git: args['--git'],
        template: args._[0],
        runInstall: args['--install'] || false
    }
}

async function promptForMissingOpts(options){
    const defaultTemplate = 'Javascript'
    if(options.skipPrompts){
        return {
            ...options,
            template: options.template || defaultTemplate
        }
    }

    const questions = []

    if(!options.template){
        questions.push(
            {
                type: 'list',
                name: 'template',
                message: 'Please choose which template to use',
                choices: ['JavaScript', 'TypeScript'],
                default: defaultTemplate
            }
        )
    }

    if(!options.git){
        questions.push(
            {
                type: 'confirm',
                name: 'git',
                message: 'Initialize a git repository',
                default: false
            }
        )
    }

    const answers = await inquirer.prompt(questions)

    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git
    }
}

export async function cli(args)
{
    let options = parseArgIntoOptions(args)
    options = await promptForMissingOpts(options)
    await createProject(options)
    
}