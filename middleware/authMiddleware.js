import jwt from "jsonwebtoken"

export const verifyToken = (
  req,
  res,
  next
) => {

  const authHeader =
    req.headers.authorization

  // TOKEN TIDAK ADA
  if (!authHeader) {

    return res.status(401).json({
      message: "Token tidak ada"
    })

  }

  // FORMAT:
  // Bearer TOKEN
  const token =
    authHeader.split(" ")[1]

  if (!token) {

    return res.status(401).json({
      message: "Token invalid"
    })

  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,

    (err, user) => {

      if (err) {

        console.log(err)

        return res.status(403).json({
          message: "Token tidak valid"
        })

      }

      // SIMPAN USER
      req.user = user

      next()

    }
  )

}