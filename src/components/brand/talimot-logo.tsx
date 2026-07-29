import Image from "next/image";

import styles from "./talimot-logo.module.css";

type TalimotLogoProps = {
  className?: string;
};

export function TalimotLogo({ className }: TalimotLogoProps) {
  const classes = [styles.logo, className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="img" aria-label="TA’LIMOT">
      <Image
        className={styles.mark}
        src="/brand/talimot-mark.svg"
        alt=""
        width={72}
        height={72}
        priority
        aria-hidden="true"
      />
      <span className={styles.wordmark}>TA’LIMOT</span>
    </div>
  );
}
