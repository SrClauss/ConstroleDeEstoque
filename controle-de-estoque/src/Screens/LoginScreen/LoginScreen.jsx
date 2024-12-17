import React, { useEffect, useState } from "react";
import "./LoginScreen.css";
import { invoke } from "@tauri-apps/api/core";
import {Person} from "@mui/icons-material";
import { NavigationContext } from "../../NavigationContext";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setActiveScreen} = React.useContext(NavigationContext);
  
    const handleLogin = () => {
       
        invoke("login", { data:{email: email, password: password} }).then((res) => {
            if (res) {
                setActiveScreen("MainScreen");
            } else {
                alert("Email ou senha inválidos");
            }
        })

    }
    return (

        <>

            <div className="main-screen" >
                <div className="left-screen">
                    <div className="just-in-time">
                        <img src="/img/logo.avif" alt="Logo" width={200} />
                    </div>
                    <div className="just-in-time">Rodrigo</div>
                    <div className="just-in-time">Informática</div>
                    <div className="ti-avancado">TI Avançado</div>

                </div>
                <div className="right-screen">
                    <div className="box-login">
                        <div className="icon-person">
                        <Person fontSize="large"/>
        
                        </div>
                        <input
                            type="text"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)} />
                        <input
                            type="password"
                            placeholder="Senha"
                            onChange={(e) => setPassword(e.target.value)} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleLogin()
                            }}}
                            
                            />
                        
                        <button onClick={handleLogin}>Login</button>


                    </div>

                </div>
            </div>
        </>
    )
}