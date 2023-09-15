$('form').submit(function(e){
    e.preventDefault()
    var formData = $(this).serialize()
    var formAction= $(this).attr('action')
    $.ajax({
       url:formAction,
       data:formData,
       type:'PUT',
       success: function(data){
       debugger
       }
    })
})
