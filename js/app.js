listarCards();

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
   listarCards();
 } else {
  window.location.href='login.html';
}
});

function listarCards(){
    showLoading();
  firebase
  .database()
  .ref("cards")
  .on("value", function(snapshot){
    console.log("Listando cards.");
    var html = "";
    snapshot.forEach(function(child){
      var card_template =
      '<div class="col-md-3">'+
      '  <div class="card" style="margin-top:15px">'+
      '    <img class="card-img-top" src="'+child.val().url_img+'" alt="" style="height:150px;width:247px;">'+
      '    <div class="card-body">'+
      '      <h4 class="card-title">Card '+child.val().titulo+'</h4>'+
      '      <p class="card-text">'+child.val().descricao+'</p>'+
      '      <p class="text-info"><strong class="card-likes">'+child.val().likes+' likes</strong></p>'+
      '      <button class="btn btn-danger btn-card-deletar" onclick="modalDeletar(\''+child.key+'\')">Deletar</button>'+
      '      <button class="btn btn-primary btn-card-like" onclick="curtir(\''+child.key+'\')">Curtir</button>'+
      '    </div>'+
      '  </div>'+
      '</div>';
      html += card_template;
    });
    $('#lista-cards').html(html);
    hideLoading();
  });
}

function modalCadastrar(){
  $('#modal-sistema').find('.modal-title').html("Cadastro de Card");
  $('#modal-sistema').find('#form-cadastro-card').show();
  $('#modal-sistema').find('#cadastro-msgs').hide();
  $('#modal-sistema').find('#bt-ok')
  .attr('onclick','salvar()')
  .html('Salvar');
  $('#modal-sistema').modal();
}

function salvar(){
  //Validação dos campos
  var titulo = $("#titulo").val();
  var descricao = $("#descricao").val().trim();
  var imagem = $("#imagem")[0].files[0];
  var valido = true;
  var campo = '';

  if("" === titulo) {
    campo = "Título";
    valido = false;
  } else if("" === descricao) {
    campo = "Descrição";
    valido = false;
  } else if("undefined" === typeof imagem) {
    campo = "Imagem";
    valido = false;
  }
  // Fim Validação

  if(!valido){
    $("#cadastro-msgs")
    .removeClass()
    .addClass('alert alert-danger')
    .html("<strong class='text-danger'><span class='glyphicon glyphicon-remove'></span>&nbsp;Erro:&nbsp;</strong>O campo <strong>"+campo+"</strong> é obrigatório.")
    .slideDown();
  } else {
    $("#cadastro-msgs").html('').slideUp();

    // Enviando imagem
    var task = firebase
    .storage()
    .ref("cards/"+imagem.name)
    .put(imagem);

    task.on(
      "state_changed",
      function progress(snapshot){
        //mostrando loading no cadastrar
        $("#cadastro-msgs")
        .removeClass()
        .addClass('alert')
        .html("<img src='img/loading.gif' style='width:40px;'>")
        .slideDown();

        var porcentagem = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        $('#progresso_upload_foto').val(porcentagem);
      },
      function error(error){        
        $("#cadastro-msgs")
        .removeClass()
        .addClass('alert alert-danger')
        .html("<strong class='text-danger'><span class='glyphicon glyphicon-remove'></span>&nbsp;Erro:&nbsp;</strong>"+error.message+".")
        .slideDown();
      },
      function complete(data){
        firebase
        .storage()
        .ref("cards/"+imagem.name)
        .getDownloadURL()
        .then(function(url_img){
          console.log("Imagem "+imagem.name+" enviada ca sucesso. URL da imagem: "+url_img);
          var data = {
            titulo: titulo,
            descricao: descricao,
            url_img: url_img,
            likes: 0,
            imagem_name: imagem.name
          };
          cadastrarCard(data);
        });

      }
      );
    console.log('salvando...;')
  }
}

function cadastrarCard(data){
  firebase
  .database()
  .ref("cards")
  .push(data)
  .then(function(result){
      
      $("#form-cadastro-card")[0].reset();
      $("#cadastro-msgs").hide();
      console.log('Card adicionado com sucesso.');
      $('#modal-sistema').modal('hide');
      $('#msgs-sistema')
      .removeClass()
      .addClass("alert alert-success alert-dismissable")
      .show()
      .find('.alert-msg')
        .html("<strong class='text-success'><span class='glyphicon glyphicon-ok'></span>&nbsp;Sucesso:&nbsp;</strong>Card adicionado com sucesso.");
      $('#progresso_upload_foto').val(0);
  })
  .catch(function(error){
    $("#cadastro-msgs").hide();
    $('#progresso_upload_foto').val(0);
    console.log("Erro ao tentar cadastrar o card "+key+". | "+error.message);
    $("#cadastro-msgs")
    .html("<strong class='text-danger'><span class='glyphicon glyphicon-remove'></span>&nbsp;Erro:&nbsp;</strong>"+error.message+".")
    .slideDown();
  });
}

function curtir(key){
  // Pegando likes
  
  var likes = 0;
  firebase
  .database()
  .ref("cards/"+key)
  .once("value").then(function(child){
    likes = child.val().likes + 1;

    // Atualizado likes
    firebase
    .database()
    .ref("cards/"+key)
    .update({likes:likes})
    .then(function(){      
      console.log("Card "+key+" curtido.");
    })
    .catch(function(error){      
      console.log(error.message);
      $("#system-msgs")
      .html("<strong class='text-danger'><span class='glyphicon glyphicon-remove'></span>&nbsp;Erro:&nbsp;</strong>"+error.message+".")
      .slideDown();
    });

  });

}

function modalDeletar(key){
  $('#modal-sistema').find('.modal-title').html("<span class='text-warning'><span class='glyphicon glyphicon-explamation-sing'></span>&nbsp;Atenção</span>");
  $('#modal-sistema').find('#form-cadastro-card').hide();
  $('#modal-sistema').find('#cadastro-msgs')
  .removeClass('alert-danger')
  .addClass('alert-warning')
  .html("<strong class='text-warning'>Tem certeza que deseja remover este item?</strong>").show();
  $('#modal-sistema').find('#bt-ok')
  .attr('onclick','deletar("'+key+'")')
  .html('Remover');
  $('#modal-sistema').modal();
}

function deletar(key){

  //Buscando nome da imagem
  firebase
  .database()
  .ref("cards/"+key)
  .once("value")
  .then(function(child){
    //Deletando imagem
    imagem_name = child.val().imagem_name;
    firebase
    .storage()
    .ref("cards/"+imagem_name)
    .delete()
    .then(function(){
      //Removendo card
      firebase
      .database()
      .ref("cards/"+key)
      .remove()
      .then(function(result){
        console.log("Card "+key+" deletado");
        $('#msgs-sistema')
          .removeClass()
          .addClass("alert alert-success alert-dismissable")
          .show()
          .find('.alert-msg')
            .html("Card deletado com sucesso.");
        $('#modal-sistema').modal('hide');
      })
      .catch(function(error){
        console.log("Erro ao tentar deletar o card "+key+". | "+error.message);
        $('#msgs-sistema')
          .removeClass()
          .addClass("alert alert-error alert-dismissable")
          .show()
          .find('.alert-msg')
          .html("<strong>Erro:&npsp;</storage>&npsp"+error.message);
          $('#modal-sistema').modal('hide');
      });
    })
    .catch(function(error){
      $('#msgs-sistema')
        .removeClass()
        .addClass("alert alert-error alert-dismissable")
        .show()
        .find('.alert-msg')
        .html("<strong>Erro:&npsp;</storage>&npsp"+error.message);
        $('#modal-sistema').modal('hide');
    });
  });
}

function showLoading(){
  $('#msgs-sistema')
  .removeClass()
  .addClass("alert alert-dismissable")
  .show()
  .find('.alert-msg')
  .html("<img src='img/loading.gif' style='width:40px;'>");
}

function hideLoading(){
  $('#msgs-sistema')
  .removeClass().hide();
}