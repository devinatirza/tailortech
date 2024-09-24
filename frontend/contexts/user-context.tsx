import { createContext, useContext, useState } from "react";
import { IUser } from "../interfaces/user-interfaces";
import axios from "axios";
import { ITailor } from "../interfaces/tailor-interfaces";

const userContext = createContext({} as any)

type ContentLayout = {
    children: JSX.Element
}

export function UserProvider({children}: ContentLayout){
    const [user, setUser] = useState<IUser|ITailor|null>(null)
    const ip = 'localhost'

    function updateUser(user: IUser|ITailor|null){
        setUser(user)
    }

    async function login(email: string, pass: string){
        try{
            const response = await axios.post(`http://localhost:8000/login/user`, {
                email: email,
                pass: pass
            }, {
                withCredentials: true
            })

            if(response.status === 200){
                setUser(response.data)
                return ''
            }
            else{
                return 'An error occured.'
            }
        } catch(error){
            return error.response?.data.error
        }
    }

    async function tailorLogin(email: string, pass: string){
        try{
            const response = await axios.post(`http://localhost:8000/login/tailor`, {
                email: email,
                pass: pass
            }, {
                withCredentials: true
            })

            if(response.status === 200){
                setUser(response.data)
                return ''
            }
            else{
                return 'An error occured.'
            }
        } catch(error){
            return error.response?.data.error
        }
    }

    const data = {user, login, tailorLogin, updateUser, ip}

    return <userContext.Provider value={data}>{children}</userContext.Provider>
}

export function useUser(){
    return useContext(userContext)
}