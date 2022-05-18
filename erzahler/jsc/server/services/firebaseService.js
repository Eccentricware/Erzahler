"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserThroughEmail = void 0;
const erzahlerDB = require('erzahlerDB');
const createUserThroughEmail = (username, email, password) => {
    // const auth = getAuth();
    erzahlerDB.get();
    console.log(username, password, email);
    // createUserWithEmailAndPassword(auth, email, password)
    //   .then((userCredential) => {
    //     const user = userCredential.user;
    //     console.log(user);
    //   })
    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //   });
};
exports.createUserThroughEmail = createUserThroughEmail;
