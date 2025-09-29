import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'


// console.log(import.meta.url)
// console.log(import.meta.filename)


const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// console.log(__dirname);
// console.log(process.cwd())

const healthLogger = async (payload) => {

    const logs_dir = path.join(__dirname,'../../logs')
    // check if logs_dir exist or not 
    if (! fs.existsSync(logs_dir)) {
        fs.mkdirSync(logs_dir,{recursive:true})
    }

    const file_path = path.join(logs_dir,'healthCheck.logs')
    
    const log_entry = `\n[${payload.timestamp}] status=${payload.status} node=${payload.node_version} uptime=${payload.uptime} memory=${payload.memory_usage} method=${payload.method} url=${payload.url} ip=${payload.ip} ua="${payload.user_agent}"\n`;
    
    fs.appendFileSync(file_path,log_entry)

}

export {healthLogger}