/* Skills listed on /skill. To publish another one, add a row here; the page
   renders whatever is in this list, in this order. */

export type Skill = {
  name: string; // the folder name under skills/ in the repo
  description: string;
};

/* One repo holds every skill, so one command installs them all. */
export const SKILLS_REPO = "vbirla789/figma-to-prototype";
export const SKILLS_REPO_URL = `https://github.com/${SKILLS_REPO}`;
export const INSTALL_COMMAND = `npx skills add ${SKILLS_REPO}`;

export const skills: Skill[] = [
  {
    name: "figma-to-prototype",
    description:
      "Paste a Figma link, get a React prototype. Builds every screen, measures each one against the Figma export and fixes the drift until it matches, wires prototype links into native transitions, and goes full-bleed on a real phone.",
  },
];
