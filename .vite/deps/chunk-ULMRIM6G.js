import {
  HTMLElementType,
  appendOwnerState_default,
  exactProp,
  getReactElementRef,
  mergeSlotProps_default,
  require_prop_types,
  resolveComponentProps_default,
  setRef,
  useEnhancedEffect_default,
  useForkRef
} from "./chunk-C3DLS7VW.js";
import {
  require_react_dom
} from "./chunk-Q7AOECBT.js";
import {
  require_react
} from "./chunk-7JZAKNLV.js";
import {
  __toESM
} from "./chunk-2TUXWMP5.js";

// node_modules/@mui/material/Portal/Portal.js
var React = __toESM(require_react());
var ReactDOM = __toESM(require_react_dom());
var import_prop_types = __toESM(require_prop_types());
function getContainer(container) {
  return typeof container === "function" ? container() : container;
}
var Portal = React.forwardRef(function Portal2(props, forwardedRef) {
  const {
    children,
    container,
    disablePortal = false
  } = props;
  const [mountNode, setMountNode] = React.useState(null);
  const handleRef = useForkRef(React.isValidElement(children) ? getReactElementRef(children) : null, forwardedRef);
  useEnhancedEffect_default(() => {
    if (!disablePortal) {
      setMountNode(getContainer(container) || document.body);
    }
  }, [container, disablePortal]);
  useEnhancedEffect_default(() => {
    if (mountNode && !disablePortal) {
      setRef(forwardedRef, mountNode);
      return () => {
        setRef(forwardedRef, null);
      };
    }
    return void 0;
  }, [forwardedRef, mountNode, disablePortal]);
  if (disablePortal) {
    if (React.isValidElement(children)) {
      const newProps = {
        ref: handleRef
      };
      return React.cloneElement(children, newProps);
    }
    return children;
  }
  return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode;
});
true ? Portal.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The children to render into the `container`.
   */
  children: import_prop_types.default.node,
  /**
   * An HTML element or function that returns one.
   * The `container` will have the portal children appended to it.
   *
   * You can also provide a callback, which is called in a React layout effect.
   * This lets you set the container from a ref, and also makes server-side rendering possible.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container: import_prop_types.default.oneOfType([HTMLElementType, import_prop_types.default.func]),
  /**
   * The `children` will be under the DOM hierarchy of the parent component.
   * @default false
   */
  disablePortal: import_prop_types.default.bool
} : void 0;
if (true) {
  Portal["propTypes"] = exactProp(Portal.propTypes);
}
var Portal_default = Portal;

// node_modules/@mui/material/utils/useSlot.js
function useSlot(name, parameters) {
  const {
    className,
    elementType: initialElementType,
    ownerState,
    externalForwardedProps,
    internalForwardedProps,
    ...useSlotPropsParams
  } = parameters;
  const {
    component: rootComponent,
    slots = {
      [name]: void 0
    },
    slotProps = {
      [name]: void 0
    },
    ...other
  } = externalForwardedProps;
  const elementType = slots[name] || initialElementType;
  const resolvedComponentsProps = resolveComponentProps_default(slotProps[name], ownerState);
  const {
    props: {
      component: slotComponent,
      ...mergedProps
    },
    internalRef
  } = mergeSlotProps_default({
    className,
    ...useSlotPropsParams,
    externalForwardedProps: name === "root" ? other : void 0,
    externalSlotProps: resolvedComponentsProps
  });
  const ref = useForkRef(internalRef, resolvedComponentsProps == null ? void 0 : resolvedComponentsProps.ref, parameters.ref);
  const LeafComponent = name === "root" ? slotComponent || rootComponent : slotComponent;
  const props = appendOwnerState_default(elementType, {
    ...name === "root" && !rootComponent && !slots[name] && internalForwardedProps,
    ...name !== "root" && !slots[name] && internalForwardedProps,
    ...mergedProps,
    ...LeafComponent && {
      as: LeafComponent
    },
    ref
  }, ownerState);
  return [elementType, props];
}

export {
  useSlot,
  Portal_default
};
//# sourceMappingURL=chunk-ULMRIM6G.js.map
