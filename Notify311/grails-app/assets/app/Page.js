Notify311.navigation = {
    history: [],
    direction: 'next',
    pageInClass: function () {
        return (this.direction === 'next' ? 'slideInRight' : 'slideInLeft')
    },
    pageOutClass: function () {
        return (this.direction === 'next' ? 'slideOutLeft' : 'slideOutRight')
    },
    lastPage: null,

    doTransition: function (vnode, args) {
        var lastPageHistory = _.nth(Notify311.navigation.history, -2);

        if (lastPageHistory === args.key) {
            Notify311.navigation.history.pop();
            Notify311.navigation.direction = 'prev';
        } else {
            Notify311.navigation.direction = 'next';
            Notify311.navigation.history.push(args.key);
        }

        var pageInClass = Notify311.navigation.pageInClass(),
            pageOutClass = Notify311.navigation.pageOutClass(),
            appBodyEl = document.querySelector('.notify311-app-body');

        //console.log('direction: ', Notify311.navigation.direction,
        //    ', pageInClass:', Notify311.navigation.pageInClass(),
        //    ', pageOutClass: ', Notify311.navigation.pageOutClass()
        //);

        var animationEndHandler = (e) => {
            console.log('Inbound ANIMATIONEND', e.type, e, vnode.dom, e.target === vnode.dom)
            e.target.classList.remove('notify311-page-new', 'animated', Notify311.navigation.pageInClass());
            appBodyEl.classList.remove('notify311-transition-parent')
            e.target.removeEventListener(e.type, animationEndHandler);
        }

        vnode.dom.addEventListener('animationend', animationEndHandler);


        var theLastPage = Notify311.navigation.lastPage;
        theLastPage.vnode.dom.addEventListener('animationend', function (e) {
            console.log('Outbound ANIMATIONEND', 'animationend', e, vnode.dom, e.target === vnode.dom, theLastPage)
            theLastPage.whenDone();
        })

        // These setTimeouts and notify311-transition-parent hacks are to get iOS Safari to paint.
        setTimeout(() => {
            theLastPage.vnode.dom.classList.add('notify311-page-last', 'animated', pageOutClass)
            vnode.dom.classList.add('notify311-page-new', 'animated', pageInClass);
        }, 1);
        setTimeout(function () {
            appBodyEl.classList.add('notify311-transition-parent')
        }, 50)
        setTimeout(function () {
            appBodyEl.classList.remove('notify311-transition-parent')
        }, 100)
    }
};

Notify311.view.Page = function (component, args) {
    console.log('Notify311.view.Page', component, args);
    return {
        oninit: function (vnode) {
            console.log('Notify311.view.Page::oninit', args, vnode);
        },
        oncreate: function (vnode) {
            console.log('Notify311.view.Page::oncreate()', vnode);

            if (!Notify311.navigation.lastPage) {
                console.log('first page -- no slides');
                Notify311.navigation.history.push(args.pageArgs.key);
                return;
            }

            Notify311.navigation.doTransition(vnode, args.pageArgs);
        },

        onupdate: function (vnode) {
            console.log('Notify311.view.Page::onupdate()', vnode);
        },


        onremove: function (vnode) {
            console.log('Notify311.view.Page::onremove()', vnode);
        },

        onbeforeremove: function (vnode) {
            console.log('Notify311.view.Page::onbeforeremove()', vnode);

            Notify311.navigation.lastPage = {
                vnode: vnode,
                key: args.pageArgs.key
            };
            return new Promise(function (resolve) {
                console.log('Notify311.view.Page::onbeforeremove() -- promise', resolve);
                Notify311.navigation.lastPage.whenDone = resolve;
            });
        },

        view: function (vnode) {
            console.log('Notify311.view.Page::view()', vnode, args);

            var pageArgs = _.assign({}, args.pageArgs),
                componentArgs = _.assign({}, args.componentArgs)

            return m('div.notify311-page', pageArgs, [
                'test',
                m(component, args.componentArgs)
            ]);
        }
    }
};
