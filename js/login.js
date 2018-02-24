function criarUsuario(){
	var email = $('#email_login').val();
	var senha = $('#senha_login').val();
	var invalido = false;

	var campo = "";
        //Valida?o dos campos
        if("" == email){
        	invalido = true;
        	campo = "E-Mail";
        } else if("" == senha){
        	invalido = true;
        	campo = "Senha";
        }

        if(invalido){
        	$('#modal-msgs').find('.modal-title').html("<strong class='text-danger'>Erro</strong>");
        	$('#modal-msgs').find('.modal-body').html("<strong class='text-danger'>O campo "+campo+" é obrigatóio.</strong>");
        	$('#modal-msgs').find('#ok').hide();
        	$('#modal-msgs').modal();
        } else {

			firebase.auth().createUserWithEmailAndPassword(email, senha)
			.then(function(user){
                $('#modal-msgs').find('.modal-title').html("<strong class='text-success'>Sucesso</strong>");
                $('#modal-msgs').find('.modal-body').html("<span class='text-success'><strong class='text-success'>Sucesso:&nbsp;</strong>Usuário criado com sucesso</span>");
                $('#modal-msgs').find('#fechar').off('hidden.bs.modal');
                $('#modal-msgs').modal();
                $('#form_login')[0].reset();
                console.log("Usuário criado com sucesso");
			})
			.catch(function(error){
        		$('#modal-msgs').find('.modal-title').html("<strong class='text-danger'>Falha</strong>");
        		$('#modal-msgs').find('.modal-body').html("<span class='text-danger'><strong class='text-danger'>Erro:&nbsp;</strong>&nbsp;"+error.message+"</span>");
        		$('#modal-msgs').modal();
			});
	}
}


function login(){
	var email = $('#email_login').val();
	var senha = $('#senha_login').val();
	var invalido = false;

	var campo = "";
        //Valida?o dos campos
        if("" == email){
        	invalido = true;
        	campo = "E-Mail";
        } else if("" == senha){
        	invalido = true;
        	campo = "Senha";
        }

        if(invalido){
        	$('#modal-msgs').find('.modal-title').html("<strong class='text-danger'>Erro</strong>");
        	$('#modal-msgs').find('.modal-body').html("<strong class='text-danger'>O campo "+campo+" ?obrigat?io.</strong>");
        	$('#modal-msgs').find('#ok').hide();
        	$('#modal-msgs').modal();
        } else {

			firebase.auth().signInWithEmailAndPassword(email, senha)
			.then(function(user){
                $('#form_login')[0].reset();
                window.location.href='index.html';
                console.log("Login efetuado");
			})
			.catch(function(error){
        		console.log(error.message);
			});
	}
}

function sair() {
	firebase.auth().signOut();
}

function logarComFacebook(){
	var provedor = new firebase.auth.FacebookAuthProvider();
	logarComProvedor(provedor);
}

function logarComGoogle(){
	var provedor = new firebase.auth.GoogleAuthProvider();
	logarComProvedor(provedor);
}

function logarComProvedor(provedor){
	firebase.auth().signInWithPopup(provedor)
	.then(function(retorno){
		window.location.href="index.html";
	})
	.catch(function(error){
		$('#modal-msgs').find('.modal-title').html("<strong class='text-danger'>Falha</strong>");
		$('#modal-msgs').find('.modal-body').html("<strong class='text-danger'>Erro no login: "+error.message+"</strong>");
		$('#modal-msgs').find('#fechar').attr('onclick','');
		$('#modal-msgs').modal();
		console.log(error.message)
		console.log('Erro no login');
	});
}
