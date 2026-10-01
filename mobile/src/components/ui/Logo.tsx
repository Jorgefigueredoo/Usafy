import Svg, { ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

export interface LogoProps {
  /** Altura em pontos; a largura segue a proporção do escudo (600 × 636). */
  size?: number;
}

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 636;

/**
 * Traçados idênticos a assets/logo.svg (a fonte usada para gerar os ícones do app).
 * A estrada em primeiro plano é uma faixa de largura variável, por isso tantos pontos.
 */
const PATHS = {
  shield:
    'M300 22C210 70 110 95 22 108C20 250 30 360 90 450C150 540 230 590 300 616' +
    'C370 590 450 540 510 450C570 360 580 250 578 108C490 95 390 70 300 22Z',
  roadFar:
    'M400 290C480 274 530 296 512 326C496 354 420 374 340 392C405 362 468 340 472 318' +
    'C476 302 450 298 410 306Z',
  roadNear:
    'M294 367.1L288.6 366.5L283.1 366.1L277.6 365.7L272.2 365.3L266.7 365.1L261.4 364.9' +
    'L256 364.8L250.7 364.8L245.5 364.8L240.3 365L235.2 365.2L230.1 365.5L225.1 365.9' +
    'L220.1 366.4L215.2 367L210.4 367.7L205.6 368.5L200.9 369.5L196.3 370.5L191.8 371.6' +
    'L187.3 372.9L182.9 374.4L178.6 375.9L174.3 377.7L170.1 379.6L166 381.7L162 384' +
    'L158.1 386.5L154.3 389.3L150.7 392.3L147.2 395.6L143.9 399.2L140.8 403.1L138 407.2' +
    'L135.5 411.6L133.3 416.3L131.5 421.1L130.2 426.2L129.2 431.3L128.6 436.9' +
    'L128.6 443.5L129.6 450.3L131.4 456.9L134 463.1L137.3 468.7L140.9 473.7L144.9 478.1' +
    'L149.2 482.1L153.6 485.7L158.1 488.9L162.8 491.9L167.6 494.6L172.6 497.2' +
    'L177.7 499.5L182.9 501.8L188.2 503.9L193.7 505.8L199.3 507.7L204.9 509.5' +
    'L210.7 511.2L216.6 512.9L222.6 514.5L228.7 516L234.8 517.5L241 518.9L247.3 520.3' +
    'L253.6 521.6L259.9 522.9L266.3 524.2L272.7 525.5L279 526.7L285.4 527.9L291.7 529.1' +
    'L298 530.2L304.3 530.9L310.6 531.2L316.8 531.5L322.9 531.9L329 532.2L334.6 532.4' +
    'L339.3 532.7L343.7 533L347.8 533.3L351.4 533.7L354.7 534.1L357.7 534.5L360.2 534.9' +
    'L362.4 535.2L364.3 535.5L365.7 535.7L366.9 535.7L367.7 535.6L368.3 535.2' +
    'L370.9 540.4L369.4 542.7L367.5 545.2L365.1 547.8L362.3 550.5L359.1 553.3' +
    'L355.5 556.1L351.5 558.9L347.1 561.8L342.2 564.6L337.1 567.4L331.5 570.3' +
    'L325.5 573.1L319.2 575.9L312.4 578.1L305.1 580.1L297.5 582.1L298.5 585.9L306.1 584' +
    'L313.5 581.9L320.5 580L327.4 578.6L333.9 577.1L340.2 575.5L346.1 574L351.8 572.3' +
    'L357.1 570.6L362.2 568.9L367 567.1L371.5 565.3L375.8 563.3L379.8 561.3L383.6 559.2' +
    'L387.1 556.9L390.5 554.4L393.6 551.8L396.4 548.8L398.9 545.4L401.1 541.7' +
    'L402.8 537.5L403.9 533L404.3 528.2L403.9 523.2L402.8 518.4L401 513.8L398.7 509.5' +
    'L396 505.5L392.8 501.8L389.4 498.4L385.6 495.2L381.6 492.2L377.3 489.4L372.7 486.7' +
    'L367.8 484.2L362.6 481.9L357.2 479.6L351.4 477.5L345.4 475.6L339.2 473.7L333.3 472' +
    'L327.3 470.2L321.2 468.4L315.1 466.7L309 465.2L302.7 464.3L296.5 463.3L290.3 462.3' +
    'L284.1 461.3L278 460.3L271.9 459.3L265.9 458.3L260 457.2L254.2 456.1L248.5 455' +
    'L243 453.9L237.6 452.7L232.3 451.5L227.3 450.3L222.4 449L217.8 447.7L213.4 446.4' +
    'L209.2 445.1L205.4 443.8L201.8 442.4L198.6 441.1L195.7 439.9L193.2 438.6' +
    'L191.1 437.5L189.4 436.5L187.4 439.1L187.4 438.8L187.3 438.2L187.3 437.8' +
    'L187.4 437.4L187.4 437L187.5 436.5L187.8 436L188.1 435.4L188.6 434.7L189.2 433.9' +
    'L190 433L191.1 432.1L192.3 431.1L193.8 430L195.5 429L197.5 427.9L199.6 426.9' +
    'L201.9 425.8L204.5 424.8L207.2 423.9L210.2 422.9L213.2 422L216.5 421.2L219.9 420.4' +
    'L223.5 419.7L227.2 419.1L231.1 418.5L235 417.9L239.1 417.5L243.3 417.1L247.6 416.8' +
    'L252 416.5L256.5 416.3L261.1 416.2L265.7 416.2L270.4 416.2L275.2 416.3L280 416.4' +
    'L284.9 416.6L290 416.9Z',
  roadStripe:
    'M212.3 400.7L208.5 401.6L204.8 402.5L201.2 403.5L197.8 404.6L194.5 405.7L191.4 407' +
    'L188.4 408.2L185.6 409.6L182.9 411.1L180.4 412.6L178.1 414.2L176 415.8L174 417.5' +
    'L172.2 419.3L170.6 421.1L169.2 423L167.9 424.9L166.9 426.9L165.9 429L165.2 431.2' +
    'L164.6 433.4L164.2 435.8L164 438.2L164 440.4L164.3 442.5L164.9 444.4L165.8 446.4' +
    'L167 448.4L168.5 450.3L170.4 452.3L172.5 454.3L175 456.2L177.9 458.2L181 460.1' +
    'L184.4 461.9L188.1 463.7L192.1 465.5L196.3 467.2L200.8 468.8L205.4 470.4L210.3 472' +
    'L215.3 473.5L220.6 475L226 476.4L231.5 477.7L237.2 479.1L242.9 480.4L248.8 481.6' +
    'L254.8 482.9L260.9 484.1L267 485.2L273.2 486.4L279.4 487.5L285.7 488.6L291.9 489.7',
  pin:
    'M300 412C258 360 180 292 180 198A120 120 0 0 1 420 198' +
    'C420 292 342 360 300 412ZM300 134A62 62 0 1 0 300 258A62 62 0 1 0 300 134Z',
};

/** Marca do Usafy: escudo (segurança) com pin de localização e estrada. */
export function Logo({ size = 72 }: LogoProps) {
  return (
    <Svg
      width={(size * VIEW_WIDTH) / VIEW_HEIGHT}
      height={size}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      accessibilityRole="image"
      accessibilityLabel="Usafy"
    >
      <Defs>
        <LinearGradient
          id="usafy-shield"
          gradientUnits="userSpaceOnUse"
          x1="60"
          y1="20"
          x2="520"
          y2="620"
        >
          <Stop offset="0" stopColor={colors.brandGradientStart} />
          <Stop offset="1" stopColor={colors.brandGradientEnd} />
        </LinearGradient>
        <ClipPath id="usafy-shape">
          <Path d={PATHS.shield} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#usafy-shape)">
        <Rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#usafy-shield)" />
        <Path d={PATHS.roadFar} fill={colors.textPrimary} />
        <Path d={PATHS.roadNear} fill={colors.textPrimary} />
        <Path
          d={PATHS.roadStripe}
          fill="none"
          stroke="url(#usafy-shield)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Contorno na cor do escudo separa o pin da estrada que passa por trás dele. */}
        <Path
          d={PATHS.pin}
          fill="none"
          stroke="url(#usafy-shield)"
          strokeWidth={24}
          strokeLinejoin="round"
        />
        <Path d={PATHS.pin} fill={colors.textPrimary} fillRule="evenodd" />
      </G>
    </Svg>
  );
}
