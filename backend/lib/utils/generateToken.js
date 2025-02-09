import jwt from "jsonwebtoken";
//take the res to set a cokie and send it back to the client
export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevent xss attacks cross-site scripting attacks
    semSite: "strict", //CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });
};
