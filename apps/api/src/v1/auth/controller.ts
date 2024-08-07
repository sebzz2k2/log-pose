import {RequestHandler, Request, Response} from "express";
import {ApiError, ApiResponse, asyncHandler} from "../../utils";
import {auth} from "../../zod";
import {checkUserExists, createUser, getJWT, verifyPassword} from "./services";


export const register: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
	const validInput = auth.registerSchema.safeParse(req.body)

	if (!validInput.success) {
		throw new ApiError(400, "Please check if required fields are present")
	}

	const user = await checkUserExists(req.body.email)

	if (user) {
		throw new ApiError(400, "User already exists")
	}
	const {email, username, password} = req.body
	const id = await createUser(email, username, password)
	const token = await getJWT(email, id[0].id)
	if (!id || !token) {
		throw new ApiError(500, "Something went wrong")
	}
	res.status(201).json(
		new ApiResponse(201, {
			user: {
				email, username
			},
			token
		}, "User created")
	)

})


export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
	const validInput = auth.loginSchema.safeParse(req.body)

	if (!validInput.success) {
		throw new ApiError(400, "Check if all required fields are present")
	}

	const {email, password} = req.body;

	const user = await checkUserExists(email)

	if (!user) {
		throw new ApiError(400, "User doesnot exist")
	}

	const verified = await verifyPassword(password, user.hash as string)

	if (!verified) {
		throw new ApiError(401, "Unauthorized")
	}

	const token = await getJWT(email, user.id as string)
	// issue with delete operator
	interface TempUser {
		username: string | null,
		email: string | null,
		hash?: string | null
	}
	const tempUser: TempUser = user;
	delete tempUser.hash
	res.status(200).json(
		new ApiResponse(200, {
			user: tempUser,
			token
		})
	)
})
