export const SET_ERROR = 'SET_ERROR';
export const SET_LOADER = 'SET_LOADER';
export const GET_TAGS = 'GET_TAGS';
export const HANDLE_RESIZE = 'HANDLE_RESIZE';
export const HANDLE_VERIFY_USER = 'HANDLE_VERIFY_USER';
export const HANDLE_HEADER_DIALOG_OPEN = 'HANDLE_HEADER_DIALOG_OPEN';
export const HANDLE_HEADER_DIALOG_CLOSE = 'HANDLE_HEADER_DIALOG_CLOSE';
export const HANDLE_CART_OPEN = 'HANDLE_CART_OPEN';
export const HANDLE_CART_CLOSE = 'HANDLE_CART_CLOSE';
export const FETCH_CARTLIST = 'FETCH_CARTLIST';
export const PUSH_TO_CART = 'PUSH_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const EDIT_CARTLIST = 'EDIT_CARTLIST';
export const HANDLE_SIGNIN = 'HANDLE_SIGNIN';
export const HANDLE_SIGNUP = 'HANDLE_SIGNUP';
export const HANDLE_SIGNOUT = 'HANDLE_SIGNOUT';

export const initialState = {
    loader: false,
    error: {
        open: false,
        message: '',
        severity: ''
    },
    openLoginDialog: false,
    openRegisterDialog: false,
    openTokenDialog: false,
    openPurchaseDialog: false,
    tags: [],
    dialogTitle: '',
    dialogData: '',
    activeDialogName: '',
    user: {
        id: '',
        name: '',
        username: '',
        email: '',
        cart: [],
        cart_count: 0
    },
    token: null,
    isAuthenticated: false,
    cartOpen: false,
    cartEmpty: true,
    cartList: []
}

const openDialog = (value) => {
    let activeDialogName = '';
    let dialogTitle = '';
    if (value === 'openLoginDialog') {
        activeDialogName = 'LoginDialog';
        dialogTitle = 'Sign In';
    } else if (value === 'openRegisterDialog') {
        activeDialogName = 'RegisterDialog';
        dialogTitle = 'Sign Up';
    } else if (value === 'openTokenDialog') {
        activeDialogName = 'TokenDialog';
        dialogTitle = 'Purchase Tokens';
    } else if (value === 'openPurchaseDialog') {
        activeDialogName = 'PurchaseDialog';
    }
    return { activeDialogName, dialogTitle };
}

export const commonReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case GET_TAGS: {
            return { ...state, tags: payload }
        }
        case SET_LOADER: {
            return { ...state, loader: payload }
        }
        case SET_ERROR: {
            return { ...state, error: payload };
        }
        case HANDLE_VERIFY_USER: {
            console.log('---HANDLE_VERIFY_USER', payload);
            return { ...state, isAuthenticated: true, user: payload }
        }
        case HANDLE_HEADER_DIALOG_OPEN: {
            console.log('---HANDLE_HEADER_DIALOG_OPEN', payload);
            if (payload.data) {
                const { activeDialogName, dialogTitle } = openDialog(payload.value);
                return { ...state, [`open${activeDialogName}`]: true, activeDialogName: activeDialogName, dialogTitle: dialogTitle, dialogData: payload.data };
            } else {
                const { activeDialogName, dialogTitle } = openDialog(payload);
                return { ...state, [`open${activeDialogName}`]: true, activeDialogName: activeDialogName, dialogTitle: dialogTitle };
            }
        }
        case HANDLE_HEADER_DIALOG_CLOSE: {
            const activeDialogName = state.activeDialogName;
            console.log('activeDialog', activeDialogName)
            return { ...state, [`open${activeDialogName}`]: payload, activeDialogName: '', dialogTitle: '', dialogData: '' };
        }
        case HANDLE_CART_OPEN: {
            return { ...state, cartOpen: true }
        }
        case HANDLE_CART_CLOSE: {
            return { ...state, cartOpen: false }
        }
        // case PUSH_TO_CART: {
        //     return { ...state, cartList: [...state.cartList, payload] }
        // }
        // case EDIT_CARTLIST: {
        //     // const cartList = state.cartList.filter(item => item.artwork === payload);
        //     // cartList.quantity
        //     // return { ...state, cartList: cart }
        //     return {
        //         ...state,
        //         cartList: state.cartList.map(cartItem => cartItem.artwork === payload.artwork ?
        //             { ...cartItem, quantity: payload.quantity, subtotal: payload.subtotal } : cartItem
        //         )
        //     };
        // }
        // case REMOVE_FROM_CART: {
        //     return { ...state, cartList: state.cartList.filter(item => item !== payload) }
        // }
        case FETCH_CARTLIST: {
            const cartList = [...payload.cart];
            console.log('---FETCH_CARTLIST', payload, cartList);
            return { ...state, user: { ...state.user, cart: cartList, cart_count: payload.cart_count } }
        }
        case PUSH_TO_CART: {
            return {
                ...state, user: { ...state.user, cart: [...state.user.cart, payload] }
            }
        }
        case HANDLE_SIGNIN: {
            console.log('---HANDLE_SIGNIN', payload);
            return { ...state, isAuthenticated: true, user: payload }
        }
        case HANDLE_SIGNUP: {
            console.log('---HANDLE_SIGNUP', payload);
            return { ...state, isAuthenticated: true, user: payload }
        }
        case HANDLE_SIGNOUT: {
            console.log('---HANDLE_SIGNOUT', payload);
            return { ...state, isAuthenticated: false, user: payload }
        }
        default:
            return state;
    }
};