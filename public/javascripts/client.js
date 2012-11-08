var socket = io.connect();

var Util = {
  data: function (name) {
    return $('html').attr('data-' + name);
  }
};

var Timeline = {
  add: function (entry) {
    this._template = this._template || _.template($('#entry-template').text());

    $('.timeline').prepend(this._template(entry));
  }
};

var main = function () {
  socket.on('entry', function (entry) {
    Timeline.add(entry);
  });

  $('.post-form').submit(function (e) {
    e.preventDefault();
    var $post_form_body = $(this).find('.post-form-body');
    var entry = { name: Util.data('user-name'), body: $post_form_body.val() };

    socket.emit('post_entry', entry);

    Timeline.add(entry);
    $post_form_body.val('');

    return false;
  });
};

$(function () {
  main();
});

