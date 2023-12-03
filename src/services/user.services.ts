import { DocumentClient } from "aws-sdk/clients/dynamodb";
import User from "../models/user";
import inputUserDto from "src/utils/userDto";
import CryptoJS from 'crypto-js';

export default class UserServerice {

    private Tablename: string = "SurajUserManagementCRUDServerlessTS";

    constructor(private docClient: DocumentClient) { }

    async createUser(user: User): Promise<User> {
        try{
            const createdAt = new Date().toISOString();

            const encryptedPassword = CryptoJS.AES.encrypt(user.password, 'serverlessTypescriptCRUD').toString();              
            user.password = encryptedPassword
            const userData = {  ...user, createdAt };
            await this.docClient.put({
                TableName: this.Tablename,
                Item: userData
            }).promise()
            console.log("User Created ",userData);
            delete user.password
            return user as User;
        }
        catch(e){
            console.log("Error in createUser ",e.message);
            throw(e.message);
        }

    }

    async getAllUsers(): Promise<User[]> {
       try{
        const users = await this.docClient.scan({
            TableName: this.Tablename,
        }).promise();
        console.log("Users list is rendered " ,users);
        
        return users.Items.map(( item : User ) => {
            delete item.password
            return item
        })
        // return users.Items as User[];
       }
       catch(e){
        console.log("Error in getAllUsers ",e.message);
        throw(e.message);
       }
    }


    async getUser(id: string): Promise < User | String > {
        try{
            console.log("Id ",id);
            const user = await this.docClient.get({
                TableName: this.Tablename,
                Key: {
                    userId: id
                }
            }).promise();
            if (!user.Item) {
                throw new Error("User For Gievn ID Not Found");
            }
            console.log("user data ",user);
            delete user.Item.password;
            return user.Item as User;
        }
        catch(e){
            console.log("Error in getUser " ,e.message);
            throw(e.message);
        }
    }


    async updateUser(id: string, user: Partial<inputUserDto>): Promise<User> {
        try{    
            const params = {
                TableName: this.Tablename,
                Key: {
                    userId: id
                },
            };
            console.log("params for getting user before updating ", params);
            const { Item } = await this.docClient.get(params).promise();
            console.log("userData ",Item);
            
            if (Item == undefined) {
                console.log(`No User Found For Given ID For Update `);
                throw new Error (`No User Found For Given ID For Update`)
            }

            const updatedUser = await this.docClient
                .update({
                    TableName: this.Tablename,
                    Key: { userId: id },
                    UpdateExpression:
                    "set username = :username , email = :email , password = :password , updatedAt = :updatedAt",
                    ExpressionAttributeValues: {
                        ":username":user.username,
                        ":email" : user.email,
                        ":password": CryptoJS.AES.encrypt(user.password, 'serverlessTypescriptCRUD').toString(),
                        ":updatedAt": new Date().toISOString()
                    },
                    ReturnValues: "ALL_NEW",
                })
                .promise();
                console.log("User updated ",updatedUser);
            delete updatedUser.Attributes.password;    
            return updatedUser.Attributes as User;
        }
        catch(e){
            console.log("Error in updateUser ",e.message);
            throw(e.message);
        }
    }


    async deleteUser(id: string): Promise<String> {
        try{

            const user = await this.docClient.get({
                TableName: this.Tablename,
                Key: {
                    userId: id
                }
            }).promise();
            if (!user.Item) {
                throw new Error("User For Gievn ID Not Found");
            }
            console.log("user data ",user);
            await this.docClient.delete({
                TableName: this.Tablename,
                Key: {
                    userId: id
                }
            }).promise();
            console.log('User Deleted Successfully!');
            return 'User Deleted Successfully!'
        }
        catch(e){
            console.log("Error in deleteUser ",e.message);
            throw(e.message);
        }
    }
}   