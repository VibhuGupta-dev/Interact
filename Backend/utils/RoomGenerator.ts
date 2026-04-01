import { Room } from "../modules/Room_modules/Room_model.js";

export async function generateRandomLetters() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i <  10; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const roomcode = await Room.findOne({roomcode : result})
    if(roomcode) {
       return generateRandomLetters()
    }
    return result;
}

