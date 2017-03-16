Notify311.view.Login = {
    onremove: function(vnode) {
        console.log('Login::onremove()', vnode);
    },

    onClickWarning: () => { Notify311.view.Modal.warn('warning modal', 'just letting you know...') },
    onClickError: () => { Notify311.view.Modal.error('error modal', ['this is an error modal', 'please try again']) },

    view: function(vnode) {
        console.log('Login::view()', vnode);
        return m('div.login', [
            'login',
            m('br'),
            m('a[href=/settings]', {
                oncreate: m.route.link
            }, 'next'),

            m('.ui.center.aligned.container', [
                m('.ui.yellow.button', {onclick: this.onClickWarning}, 'warning'),
                m('.ui.red.error.button', {onclick: this.onClickError}, 'error')
            ])
        ]);
    }
};
