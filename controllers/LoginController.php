<?php

namespace Controllers;

use Model\Usuario;
use MVC\Router;
use Classes\Email;

class LoginController{
    public static function login(Router $router){
        $alertas = [];
        $auth = new Usuario;
        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);

            $alertas = $auth->validarLogin();

            if(empty($alertas)){
                //Comprobar que exista el usuario
                $usuario = Usuario::where('email',$auth->email);
                if($usuario){
                    //Verificar Usuario
                    if($usuario->comprobarPasswordAndVerificado($auth->password)){
                        //Autenticar Usuario
                        session_start();
                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre . " " .$usuario->apellido;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;
                        
                        //Redireccionar
                        if($usuario->admin === "1"){
                            $_SESSION['admin'] = $usuario->admin ?? null; 
                            header('Location: /admin');
                        }
                        else{
                            header('Location: /cita');
                        }

                    }
                }
                else{
                    Usuario::setAlerta('error','Usuario no encontrado');
                }
            }

        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/login',[
            'alertas'=>$alertas,
            'auth'=>$auth
        ]);
    }
    public static function logout(){
        session_start();
        $_SESSION = [];
        header('Location: /');
    }
    public static function olvide(Router $router){
        $alertas = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new USuario($_POST);
            $alertas = $auth->validarEmail();

            if(empty($alertas)){
                $usuario = Usuario::where('email',$auth->email);
                
                if($usuario && $usuario->confirmado === '1'){
                    //Generar un Token
                    $usuario->crearToken();
                    $usuario->guardar();

                    //TODO: Enviar Email
                    $email = new Email($usuario->nombre, $usuario->email,$usuario->token);
                    $email->enviarInstrucciones(); 
                    
                    //alerta exito
                    Usuario::setAlerta('exito','Revisa tu email');  
                }
                else{
                    Usuario::setAlerta('error','el usuario no existe o no esta confirmado');
                }
                
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/olvide-password',[
            'alertas'=>$alertas
        ]);
    }
    public static function recuperar(Router $router){
        $alertas = [];
        $error = false;
        $token = s($_GET['token']);

        //Buscar usuario por su token

        $usuario = Usuario::where('token',$token);
        
        if(empty($usuario)){
            Usuario::setAlerta('error','token no valido');
            $error = true;
        }

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            // Leer el nuevo password y guardar
            $password = new Usuario($_POST);
            $alertas = $password->validarPassword(); 
        
            if(empty($alertas)){
                $usuario->password = null;
                $usuario->password = $password->password;
                $usuario->hashearPassword();
                $usuario->token = null;

                $resultado = $usuario->guardar();

                if($resultado){
                    header('Location: /');
                }
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/recuperar-password',[
            'alertas' => $alertas,
            'error' => $error
        ]);
    }
    public static function crear(Router $router){
        $usuario = new Usuario;

        //alertas vacias
        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $usuario->sincronizar($_POST);
            $alertas = $usuario->validarNuevaCuenta(); 

            //ver si alertas esta vacio y validar que el usuario no exista 
            if(empty($alertas)){
                $resultado = $usuario->existeUsuario();
                
                if($resultado->num_rows){
                    $alertas = Usuario::getAlertas();
                }
                else{
                    //Hashear password
                    $usuario->hashearPassword();

                    //Creo un token único
                    $usuario->crearToken();

                    //Enviar el Email
                    $email = New Email($usuario->nombre,$usuario->email,$usuario->token);
                    $email->enviarConfirmacion();

                    //Crear el usuario
                    $resultado = $usuario->guardar();
                    
                    if($resultado){
                        header('Location: /mensaje');
                    }
                    
                    
                }
            }

        }
        $router->render('auth/crear-cuenta',[
            'usuario'=> $usuario,
            'alertas'=> $alertas,
            
        ]); 
    }
    public static function mensaje(Router $router){
        $router->render('auth/mensaje');
    }
    public static function confirmar(Router $router){
        $alertas=[];
        $token = s($_GET['token']);
        $usuario = Usuario::where('token',$token);
       // debuguear($usuario);
        if(empty($usuario)){
            //Mostrar mensaje de error 
            Usuario::setAlerta('error','Token no valido');
        }
        else{
            //Modificar a usuario confirmado
            $usuario->confirmado = '1';
            $usuario->token = null;
            $usuario->guardar();
            Usuario::setAlerta('exito','Cuenta Comprobada Correctamente');
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/confirmar-cuenta',[
            'alertas'=>$alertas
        ]);
    }
}