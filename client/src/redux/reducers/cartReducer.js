import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  DELETE_FROM_CART,
  MAKE_ORDER,
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST
} from "../actions/types";

const INITIAL_STATE = {
  cart: [],
  wishlist: []
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const productExists = state.cart.find(
        product => product._id.toString() === action.payload._id.toString()
      );
      if (productExists) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item._id.toString() === action.payload._id.toString()
              ? { ...action.payload, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [{ ...action.payload, quantity: 1 }, ...state.cart]
      };
    case REMOVE_FROM_CART:
      const existingCartItem = state.cart.find(
        item => item._id.toString() === action.payload._id.toString()
      );
      if (existingCartItem.quantity === 1) {
        return {
          ...state,
          cart: state.cart.filter(
            item => item._id.toString() !== action.payload._id.toString()
          )
        };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item._id.toString() === action.payload._id.toString()
            ? { ...action.payload, quantity: action.payload.quantity - 1 }
            : item
        )
      };
    case DELETE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(
          item => item._id.toString() !== action.payload._id.toString()
        )
      };
    case MAKE_ORDER:
      return { ...state, cart: [] };
    case ADD_TO_WISHLIST:
      return { ...state, wishlist: [action.payload, ...state.wishlist] };
    case REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item._id !== action.payload._id)
      };
    default:
      return state;
  }
};
