Notify311.view.Modal = (function () {

    var modalEl,
        messageContent = '',
        messageDetails = '',
        modalClass = '',
        isWarning = false;

    return {

        error: function (message, details) {
            messageContent = message || 'An unexpected error has occurred';
            messageDetails = details || '';
            isWarning = false;
            modalClass = 'i.red.warning.circle.icon';
            messageClass = '.ui.error.tiny.message';
            m.redraw();
            modalEl.modal('show');
        },

        warn: function (message, details) {
            messageContent = message || '';
            messageDetails = details || '';
            isWarning = true;
            modalClass = 'i.yellow.warning.circle.icon';
            messageClass = '.ui.warning.tiny.message';
            //m.redraw();
            modalEl.modal('show');
        },

        hide: function () {
            modalEl.modal('hide');
        },

        oninit: function (vnode) {
            console.log('Notify311.view.Modal::oninit');
        },

        oncreate: function (vnode) {
            modalEl = $(vnode.dom).modal({
                closable: false
            });
        },

        view: function (vnode) {
            console.log('Notify311.view.Modal::view');
            var messageVnode = [
                    m('.ui.center.aligned.container', messageContent)
                ],
                detailsVnode;

            if (messageDetails instanceof Array) {
                detailsVnode = messageDetails.map(function (it) {
                    return m('p', it)
                });
            } else {
                detailsVnode = m('p', messageDetails);
            }

            if (messageDetails) messageVnode.push(m(messageClass, detailsVnode));

            return m('.ui.modal.notify311-modal', [
                m('.ui.icon.top.attached.header', m(modalClass), isWarning ? '' : 'Server Error'),
                m('i.close.icon'),
                m('.content', [
                    m('.description', messageVnode)
                ])
            ])
        }
    };

})();

Notify311.view.LoadingMask = (function () {

    var parentEl,
        dimmerEl
    args = null,
        isActive = false

    return {

        show: function () {
            console.log('showing')
            parentEl.classList.add('active')
            parentEl.classList.remove('inactive')
//            $(dimmerEl).dimmer({debug: true, verbose: true}, 'show')//.dimmer('hide').on('animationend', (it) => console.log(it))
            isActive = true
            m.redraw()
        },

        hide: function () {
            console.log('hiding')
            isActive = false
            m.redraw()
        },

        oncreate: function (vnode) {
            parentEl = vnode.dom.parentElement
            dimmerEl = vnode.dom
        },

        view: function (vnode) {
            var animationEnd = (it) => {
                    console.log('animationEnd', it, isActive)
                        var names = ['animating', 'fade', 'in', 'out']
                        if(!isActive) {
                            parentEl.classList.remove('active')
                            parentEl.classList.add('inactive')
                        }
                        names.forEach( (name) => {
                            dimmerEl.classList.remove(name)
                        }
                    )
                },
                attrs = isActive ? {
                    class: 'active transition visible animating fade in',
                    onanimationend: animationEnd
                } : {
                    class: 'active transition hidden animating fade out',
                    onanimationend: animationEnd
                }
            return m('.ui.page.dimmer', attrs, [
                m('.ui.text.loader', (args && args.message) || 'One moment...')
            ]);
        },

        xview: function (vnode) {
            return m('.ui.text.loader', (args && args.message) || 'One moment...')
        }
    }

})();

