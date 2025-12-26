import styles from "./SocialNetworks.module.css";
import clsx from "clsx";

import FacebookSVG from "../../assets/icons/facebook.svg?react";
import InstagramSVG from "../../assets/icons/instagram.svg?react";
import YoutubeSVG from "../../assets/icons/youtube.svg?react";

const socialLinks = [
  {
    href: "https://www.facebook.com",
    id: "facebook",
    label: "Facebook",
    Icon: FacebookSVG,
  },
  {
    href: "https://www.instagram.com",
    id: "instagram",
    label: "Instagram",
    Icon: InstagramSVG,
  },
  {
    href: "https://www.youtube.com",
    id: "youtube",
    label: "YouTube",
    Icon: YoutubeSVG,
  },
];

export const SocialNetworks = () => {
  return (
    <ul className={styles.list}>
      {socialLinks.map((link) => {
        const { href, id, label, Icon } = link;

        return (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={clsx(styles.light, styles.link)}
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
};
