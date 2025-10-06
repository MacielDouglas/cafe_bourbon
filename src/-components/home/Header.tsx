import {
  Coffee,
  GraduationCap,
  Menu,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import { NavLink } from "../nav-link";

const menu = [
  {
    nome: "Cafes",
    link: "/cafes",
    icon: <Coffee />,
  },
  {
    nome: "Compras",
    link: "/compras",
    icon: <ShoppingCart />,
  },
  {
    nome: "Assinatura",
    link: "/assinatura",
    icon: <Package />,
  },
  {
    nome: "Cursos",
    link: "/cursos",
    icon: <GraduationCap />,
  },
];

const Header = () => {
  return (
    <header className="w-full max-w-7xl bg-zinc-950 mx-auto h-20 flex items-center px-5">
      <div className="drawer lg:hidden flex items-center justify-between">
        <div>
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            <div className="navbar  w-full lg:hidden">
              <label
                htmlFor="my-drawer-3"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost"
              >
                <Menu />
              </label>
            </div>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-3"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 min-h-full w-80 p-4 space-y-5">
              <p className="text-2xl font-bold tracking-widest uppercase text-center mb-14">
                Café BOURBON
              </p>
              {menu.map((item) => (
                <li key={item.nome} className="uppercase text-xl">
                  <NavLink to={item.link}>
                    {item.icon}

                    {item.nome}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="font-bold tracking-widest">BOURBON</p>
        <ShoppingCart />
      </div>
      <div className="navbar space-x-6 hidden lg:flex">
        {menu.map((item) => (
          <NavLink key={item.link} to={item.link} className="uppercase">
            {item.nome}
          </NavLink>
        ))}
      </div>
      <div className="navbar-end items-center space-x-3 uppercase hidden lg:flex">
        <NavLink to="/signIn">Inscreva-se</NavLink>
        <NavLink to="/login">
          <User />
        </NavLink>
        <ShoppingCart />
      </div>
    </header>
  );
};

export default Header;
