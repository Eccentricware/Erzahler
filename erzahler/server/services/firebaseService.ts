import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
const erzahlerDB = require('erzahlerDB');

export const createUserThroughEmail = (username: string, email: string, password: string) => {
  // const auth = getAuth();
  erzahlerDB.get()
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
}
