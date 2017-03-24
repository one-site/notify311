Notify311.model.Notify311Dashboard = function Notify311Component(vnode) {
    return {

        load$: () => {

            return Rx.Observable.ajax({
                method: "GET",
                //url: "/notification/",
                url: "/static/json/notifications.json",
                headers: {'Content-Type': 'application/json'}
            })

        }
    }
}


Notify311.view.Notify311ViewImages = function Notify311ViewImages(vnode) {
    let parentScope = vnode.attrs.parentScope

    return {
        view: (vnode) => {
            let notification = parentScope.getSelected()
            console.log(parentScope, notification)
            return notification.images
                ? m('img.ui middle aligned image', {src: notification.images[0].url})
                : m('', 'No images submitted')
        }
    }
}

Notify311.view.Notify311ViewDescription = function Notify311ViewDescription(vnode) {
    let parentScope = vnode.attrs.parentScope

    return {
        view: (vnode) => {
            let notification = parentScope.getSelected()
            console.log('Notify311ViewDescription', parentScope, notification)
            return m('', [
                m('p', 'Posted: ' + moment(notification.dateCreated).format('D-MMM-YYYY hh:mm A')),
                m('p', 'Where: ' + notification.location.address1),
                m('p', notification.description)
            ])
        }
    }
}

Notify311.view.Notify311ViewMap = function Notify311ViewMap(vnode) {

    let parentScope = vnode.attrs.parentScope,
        lastSelected,
        map


    function initMap(el) {
        console.log(parentScope)
        let location = _.find(parentScope.notifications, (it) => {
            return it.id === parentScope.selectedItem
        }).location
        map = new google.maps.Map(el, {
            center: {lat: location.latitude, lng: location.longitude},
            zoom: 15
        });
        let marker = new google.maps.Marker({
            position: {lat: location.latitude, lng: location.longitude},
            map: map
        })
    }

    return {
        oncreate: (vnode) => {
            initMap(vnode.dom)
        },
        onremove: (vnode) => {
            console.log('onremove')
        },
        onbeforeupdate: (oldVnode, newVnode) => {
            console.log('onbeforeupdate')
            if (lastSelected != parentScope.selectedItem) {
                console.log('Do update map', map)
                return true
            }
        },
        view: (vnode) => {
            lastSelected = parentScope.selectedItem
            return m('div', {style: {height: '100%'}})
        }
    }
}

Notify311.view.Notify311ViewDetails = function Notify311ViewDetails(vnode) {

    let parentScope = vnode.attrs.parentScope

    return {
        view: (vnode) => {
            return m('.ui.grid.container', [
                m('.ui.eight.wide.column', {style: {height: '50%'}}, [
                    m(Notify311.view.Notify311ViewImages, {key: parentScope.selectedItem, parentScope: parentScope})
                ]),
                m('.ui.eight.wide.column', {style: {height: '50%'}}, [
                    m(Notify311.view.Notify311ViewMap, {key: parentScope.selectedItem, parentScope: parentScope})
                ]),
                m('.ui.sixteen.wide.column.segment', {style: {height: '50%'}}, [
                    m(Notify311.view.Notify311ViewDescription, {key: parentScope.selectedItem, parentScope: parentScope})
                ])
            ])
        }
    }
}

Notify311.view.Notify311Dashboard = function Notify311Component(vnode) {

    let parentScope = {
            selectedItem: undefined,
            notifications: [],
            getSelected: function () {
                console.log('in getSelected')
                return _.find(this.notifications, (it) => {
                    return it.id === this.selectedItem
                })
            }
        },
        notificationStore = new Notify311.model.Notify311Dashboard()

    Notify311.view.LoadingMask.show()

    notificationStore.load$().subscribe({
        next: (it) => {
            console.log(it)
            _.assign(parentScope.notifications, it.response)
        },
        error: (error) => {
            Notify311.view.LoadingMask.hide()
            Notify311.view.Modal.error(error.message)
            console.log(error)
        },
        complete: (it) => {
            Notify311.view.LoadingMask.hide()
            m.redraw()
        }
    })

    return {
        view: (vnode) => {
            console.log(parentScope, parentScope.notifications)
            return m('div.ui container', [
                m('div.ui grid', [
                    m('.ui.four.wide.column', [
                        m(Notify311.view.Notify311List, {parentScope: parentScope})
                    ]),
                    m('.ui.twelve.wide.column.segment', {style: {height: '100vh', overflowY: 'auto'}}, [
                        parentScope.selectedItem
                            ? m(Notify311.view.Notify311ViewDetails, {parentScope: parentScope})
                            : m('', 'Select a notification')
                    ])
                ])
            ])
        }

    }
}

Notify311.view.Notify311List = function Notify311List(vnode) {

    let parentScope = vnode.attrs.parentScope,
        vnodeItem = (item) => {
            let created = moment(item.dateCreated).fromNow(),
                attrsSelected = _.get(item, 'id') === parentScope.selectedItem
                ? {
                    attrsIcon: {style: {backgroundColor: 'rgba(152, 251, 152, 0.2)'}},
                    attrsItem: {style: {backgroundColor: 'rgba(0, 0, 0, 0.027451)'}}
                } : {attrsIcon: {}, attrsItem: {}}

            return m('.item', {
                style: attrsSelected.attrsItem.style || {},
                onclick: (e) => {
                    _.set(parentScope, 'selectedItem', item.id)
                }
            }, [
                m('i.right triangle icon', attrsSelected.attrsIcon),
                m('.content', [
                    m('.header', item.name),
                    m('.description', 'Posted: ' + created)
                ])
            ])
        }

    return {

        view: (vnode) => {

            return m('div.ui middle aligned selection list',
                parentScope.notifications.map(vnodeItem)
            )
        }
    }

}

