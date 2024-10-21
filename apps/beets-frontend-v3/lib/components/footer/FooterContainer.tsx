import { BeetsLogoType } from '../imgs/BeetsLogoType'
import { useNavData } from '../navs/useNavData'
import { useFooterData } from './useFooterData'
import { Footer } from '@repo/lib/shared/components/navs/Footer'

export function FooterContainer() {
  const { linkSections, legalLinks } = useFooterData()
  const { getSocialLinks } = useNavData()

  return (
    <Footer
      linkSections={linkSections}
      socialLinks={getSocialLinks()}
      legalLinks={legalLinks}
      title="AMMs made easy"
      subTitle="Beets is a battle-tested toolkit for true AMM experimentation and innovation."
      logoType={<BeetsLogoType />}
    />
  )
}
