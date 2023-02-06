
import * as core from '@actions/core';


async function main() {
    let name: string = core.getInput('name');

    core.debug(`Hello ${name}!`);

    console.log(`Hello ${name}!`);

}

main()
