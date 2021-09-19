const join = children => {
  return children
    .map(v => {
      if (Array.isArray(v)) return join(v);
      return v;
    })
    .join("");
};

export function factory(tag, props, ...children) {
  if (typeof tag === "function") {
    return tag({ ...props, children });
  }
  const propStr = props
    ? `${Object.entries(props)
        .map(([k, v]) => {
          if (k === "className") return ["class", v];
          return [k, v];
        })
        .filter(([k, v]) => {
          return v !== undefined && v !== null;
        })
        .map(([k, v]) => {
          if (typeof v === "object") {
            const _v = Object.entries(v)
              .map(([k, v]) => {
                const _k = k.replace(/([A-Z])/g, "-$&").toLocaleLowerCase();
                if (k === "zIndex") return `${_k}: ${v}`;
                if (k === "opacity") return `${_k}: ${v}`;
                return `${_k}: ${typeof v === "number" ? `${v}px` : v}`;
              })
              .join("; ");
            return `${k}="${_v}"`;
          }
          return `${k}="${v}"`;
        })
        .join(" ")}`.trim()
    : "";
  return `<${tag}${propStr ? ` ${propStr}` : ""}>${join(children)}</${tag}>`;
}

export function Fragment(props) {
  const { children } = props;
  return join(children);
}

export function render(content) {
  return `<!DOCTYPE html>${content}`;
}
