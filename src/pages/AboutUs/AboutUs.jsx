import Container from "../../components/UI/Container/Container";
import { Typography } from "../../components/Typography/Typography";
import css from "./AboutUs.module.css";

export default function AboutUs() {
  return (
    <div className={css.container}>
      <Container>
        <section className={css.hero}>
          <Typography variant="h1" className={css.title}>
            Про нас
          </Typography>
          <Typography variant="body" className={css.subtitle}>
            SELL-O - платформа, що об'єднує українську спільноту по всьому світу
          </Typography>
        </section>

        <section className={css.mission}>
          <Typography variant="h2" className={css.sectionTitle}>
            Наша місія
          </Typography>
          <Typography variant="body" className={css.text}>
            Ми створили SELL-O, щоб українці в будь-якій точці світу могли легко
            знаходити один одного, обмінюватися послугами та підтримувати свою
            спільноту.
          </Typography>
          <Typography variant="body" className={css.text}>
            "Свій до Свого по Своє" - це не просто слоган, а наша філософія. Ми
            віримо в силу єдності та взаємодопомоги українців по всьому світу.
          </Typography>
        </section>

        <section className={css.values}>
          <Typography variant="h2" className={css.sectionTitle}>
            Наші цінності
          </Typography>
          <div className={css.valuesList}>
            <div className={css.valueItem}>
              <Typography variant="h3" className={css.valueTitle}>
                Єдність
              </Typography>
              <Typography variant="body" className={css.text}>
                Об'єднуємо українців незалежно від того, де вони знаходяться
              </Typography>
            </div>
            <div className={css.valueItem}>
              <Typography variant="h3" className={css.valueTitle}>
                Підтримка
              </Typography>
              <Typography variant="body" className={css.text}>
                Допомагаємо один одному знаходити потрібні послуги та фахівців
              </Typography>
            </div>
            <div className={css.valueItem}>
              <Typography variant="h3" className={css.valueTitle}>
                Глобальність
              </Typography>
              <Typography variant="body" className={css.text}>
                Працюємо для українців у всіх куточках світу
              </Typography>
            </div>
          </div>
        </section>

        <section className={css.cta}>
          <Typography variant="h2" className={css.sectionTitle}>
            Приєднуйтесь до нас
          </Typography>
          <Typography variant="body" className={css.text}>
            Станьте частиною найбільшої платформи послуг української спільноти.
            Додайте свою послугу або знайдіть потрібного фахівця вже сьогодні!
          </Typography>
        </section>
      </Container>
    </div>
  );
}
