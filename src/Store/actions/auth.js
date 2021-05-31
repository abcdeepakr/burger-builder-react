import axios from 'axios'

import * as actions from './actionTypes'

export const authStart = () =>{
    return {
        type:actions.AUTH_START
    }
}
export const authSuccess = (idToken,userId) =>{
    return {
        type:actions.AUTH_SUCCESS,
        idToken : idToken,
        userId : userId
    }
}
export const authFail = (error) =>{
    return {
        type:actions.AUTH_FAIL,
        error : error
    }
}
export const logout = () =>{
    localStorage.removeItem('token')
    localStorage.removeItem('expirationDate')
    localStorage.removeItem('userId')
    return {
        type:actions.AUTH_LOGOUT,
    }
}

export const checkAuthTimeout = (expirationTime) =>{
    return dispatch =>{
        setTimeout(() =>{
            dispatch(logout())
        },expirationTime*1000)
    }
}

export const auth =(email,password,isSignUp) =>{
    return dispatch =>{
        dispatch(authStart())
        const authData = {
            email :email,
            password: password,
            returnSecureToken: true
        }
        let url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyA-z9ye2snd0RWIrgXsVxX17XuUkE4owEo'
        if(!isSignUp){
            url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA-z9ye2snd0RWIrgXsVxX17XuUkE4owEo'
        }
        axios.post(url,authData)
        .then(response =>{
            console.log(response)
            const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);
            localStorage.setItem('token',response.data.idToken)
            localStorage.setItem('expiration Date', expirationDate)
            localStorage.setItem('userId', response.data.localId)
            dispatch(authSuccess(response.data.idToken, response.data.localId))
            dispatch(checkAuthTimeout(response.data.expiresIn))
            
        })
        .catch(err =>{
            console.log(err.response)
            dispatch(authFail(err.response))
        })
    }
}

export const setAuthRedirectPath = (path) =>{
    return{
        type: actions.SET_AUTH_REDIRECT_PATH,
        path: path
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if (expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(token, userId));
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000 ));
            }   
        }
    };
};