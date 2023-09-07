import { ICartProduct, ShippingAddress } from "@/interfaces";
import { createContext } from "react";


interface ContextProps {
    isLoaded: boolean;
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    impuesto: number;
    total: number;

    shippingAddress?: ShippingAddress;

    // Metodos
    addProductToCart: (product: ICartProduct) => void;
    updateCartQuantity: (product: ICartProduct) => void;
    removeCartProduct: (product: ICartProduct) => void;
    updateAddress: (address: ShippingAddress) => void;

    // Orders
    createOrder: () => Promise<{ hasError: boolean; message: string; }>
}

export const CartContext = createContext({} as ContextProps);