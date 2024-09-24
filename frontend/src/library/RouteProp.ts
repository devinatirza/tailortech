import { StackScreenProps } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IStackScreenProps } from "./StackScreenProps";

export interface IRouteProps {
    component: React.FunctionComponent<IStackScreenProps>;
    name: string;
}