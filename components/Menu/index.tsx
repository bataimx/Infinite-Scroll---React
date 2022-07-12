import { Button } from 'antd';
import * as React from 'react';
import { Link, LinkProps, useMatch, useResolvedPath } from 'react-router-dom';

export default function Menu() {
  return (
    <div>
      <CustomLink to="normal">Normal scroll</CustomLink>
      <CustomLink to="infinite">Infinite scroll</CustomLink>
      <CustomLink to="infinite-v2">Infinite scroll v2</CustomLink>
      <CustomLink to="mansory-infinite">Mansory-infinite</CustomLink>
    </div>
  );
}

export function CustomLink({ children, to, ...props }: LinkProps) {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <React.Fragment>
      <Link
        style={{ textDecoration: match ? 'underline' : 'none' }}
        to={to}
        {...props}
      >
        <Button type={match ? 'primary' : 'default'}>{children}</Button>
      </Link>
    </React.Fragment>
  );
}
