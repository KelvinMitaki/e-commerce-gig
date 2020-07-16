import {
  STORE_IMAGE,
  ADD_PRODUCT,
  STORE_IMAGE_START,
  STORE_IMAGE_STOP,
  EDIT_PRODUCT
} from "../actions/types";

const INITIAL_STATE = {
  imageUrl: [],
  storeImageLoading: false
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case STORE_IMAGE_START:
      return { ...state, storeImageLoading: true };
    case STORE_IMAGE_STOP:
      return { ...state, storeImageLoading: false };
    case STORE_IMAGE:
      return { ...state, imageUrl: [...state.imageUrl, action.payload] };
    case ADD_PRODUCT:
      return { ...state, imageUrl: [] };
    case EDIT_PRODUCT:
      return { ...state, imageUrl: [] };
    default:
      return state;
  }
};
