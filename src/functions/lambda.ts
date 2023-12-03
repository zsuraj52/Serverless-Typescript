import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from '../libs/api-gateway';
import { middyfy } from '../libs/lambda';
import { v4 } from "uuid";
import userService from '../services/index'
import inputUserDto  from "src/utils/userDto";
import updateUserDto  from "src/utils/userDto";


export const getAllUsers = middyfy(async (): Promise<APIGatewayProxyResult> => {
    const users = await userService.getAllUsers();
    return formatJSONResponse ({
        users
    })
})


export const createUser = middyfy(async (event: APIGatewayProxyEvent & inputUserDto): Promise<APIGatewayProxyResult> => {
    try {
        const id = v4();
        const user = await userService.createUser({
            userId: id,
            username: event.body["username"],
            email: event.body["email"],
            password: event.body["password"],
            createdAt: new Date().toISOString(),
            updatedAt: null
        })
        return formatJSONResponse({
            user
        });
    } catch (e) {
        return formatJSONResponse({
            status: 500,
            message: e
        });
    }
})


export const getAllUsersList = middyfy(async (): Promise<APIGatewayProxyResult> => {

    try {
        const user = await userService.getAllUsers()
        return formatJSONResponse({ user });
    } catch (e) {
        return formatJSONResponse({
            status: 400,
            message: e
        });
    }
})


export const getUser = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.userId;    
    try {
        const user = await userService.getUser(id)
        return formatJSONResponse({
            user, id
        });
    } catch (e) {
        return formatJSONResponse({
            status: 400,
            message: e
        });
    }
})


export const updateUser = middyfy(async (event:APIGatewayEvent & updateUserDto): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.userId;   
    try {
        const todo = await userService.updateUser(id,{
            username: event.body["username"],
            email: event.body["email"],
            password: event.body["password"],
        })
        todo.updatedAt = new Date().toISOString()
        return formatJSONResponse({
            todo, id
        });
    } catch (e) {
        return formatJSONResponse({
            status: 500,
            message: e
        });
    }
})


export const deleteUser = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.userId;
    try {
        const todo = await userService.deleteUser(id)
        return formatJSONResponse({
            todo, id
        });
    } catch (e) {
        return formatJSONResponse({
            status: 404,
            message: e
        });
    }
})