import { useDispatch } from "react-redux";

import { openSignIn, openSignUp } from "../../store/auth";

import { DualButtonGroup } from "../DualButtonGroup/DualButtonGroup.jsx";

export const AuthBar = () => {
  const dispatch = useDispatch();

  return (
    <DualButtonGroup
      leftLabel="Увійти"
      rightLabel="Реєстрація"
      onLeftClick={() => dispatch(openSignIn())}
      onRightClick={() => dispatch(openSignUp())}
    />
  );
};
