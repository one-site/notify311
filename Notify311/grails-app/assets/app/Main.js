Notify311 = (function () {

    console.log('Constructing Notify311');

    return {
        view: {},
        model: {},
        store: {},

        onReady: function () {

            m.mount(document.querySelector('body div.ui.dimmer.modals'), Notify311.view.Modal);
            m.mount(document.querySelector('body div.notify311-loading-mask'), Notify311.view.LoadingMask);

            m.route(document.querySelector('body .notify311-app-body'), '/login', {
                '/login': Notify311.view.Page(Notify311.view.Login, {
                    pageArgs: {
                        class: 'notify311-page-login',
                        key: 'login'
                    },
                    componentArgs: {
                        foo: 'bar',
                        key: 'login-component'
                    }
                }),
                '/settings': Notify311.view.Page(Notify311.view.Settings, {
                    pageArgs: {
                        class: 'notify311-page-settings',
                        key: 'settings'
                    }
                }),
                '/settings2': Notify311.view.Page(Notify311.view.Settings, {
                    pageArgs: {
                        class: 'notify311-page-settings',
                        style: {
                            backgroundColor: 'green'
                        },
                        key: 'settings2'
                    },
                    componentArgs: {
                        style: {
                            backgroundColor: 'antiquewhite'
                        },
                        showNext: false
                    }
                }),
                '/notify311': Notify311.view.Notify311Component
            });
        }
    }

})();

