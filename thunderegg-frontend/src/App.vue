<template>
    <article class="content has-background-primary">
        <section class="hero is-primary">
            <div class="hero-body">
                <div class="container">
                    <h1 class="is-size-1 has-text-primary-light has-text-centered pt-3 has-brand-text">ThunderEgg</h1>
                </div>
            </div>
        </section>

        <section>
            <div class="columns is-multiline has-text-centered">
                <div class="column is-one-third">
                    <thunder-egg-p5 egg-id="1" owner="0x818Ff73A5d881C27A945bE944973156C01141232"></thunder-egg-p5>
                </div>
                <div class="column is-one-third">
                    <thunder-egg-p5 egg-id="2" owner="0x4D20F13e70320e9C11328277F2Cc0dC235A74F27"></thunder-egg-p5>
                </div>
                <div class="column is-one-third">
                    <thunder-egg-p5 egg-id="3" owner="0x84FF65C60Ff63a6eedCDDD82ad139e28da82FCDc"></thunder-egg-p5>
                </div>
                <div class="column is-one-third">
                    <thunder-egg-p5 egg-id="4" owner="0x3f8C962eb167aD2f80C72b5F933511CcDF0719D4"></thunder-egg-p5>
                </div>
            </div>
        </section>
    </article>
</template>

<script>
  import axios from 'axios';
  import {onMounted, ref} from 'vue';
  import ThunderEggP5 from './components/ThunderEggP5';

  export default {
    components: {ThunderEggP5},
    setup() {
      let artists = ref([]);
      let disabledArtists = ref(null);
      let artistsWithoutCoverImg = ref(null);
      let artistsWithoutProfileImg = ref(null);
      let artistTimeStamp = ref(null);
      let artistsEnabled = ref(null);


      function artistsUpdatedInLast24Hrs(artistTimeStamp) {
        let ts = Math.round(new Date().getTime() / 1000);
        let tsYesterday = ts - (24 * 3600);
        if (artistTimeStamp > (tsYesterday * 1000)) {
          return artists;
        }
      }

      function artistsEnabledInLastWeek(artistsEnabled, enabledTimestamp) {
        let tsLastWeek = new Date().getTime() - 604800000;
        if (artistsEnabled && enabledTimestamp >= tsLastWeek) {
          return artists;
        }
      }

      function percentageOfArtists(partialArtistCount) {
        return `${((partialArtistCount / artists.value.length) * 100).toFixed(2)} %`;
      }

      onMounted(async () => {
        const {status, data} = await axios.get('https://us-central1-known-origin-io.cloudfunctions.net/main/api/artist/collective');
        // console.log(result);
        if (status === 200) {
          artists.value = data;

          disabledArtists.value = artists.value.filter(artist => !artist.enabled);

          console.log('disabledArtists', disabledArtists);

          artistsWithoutCoverImg.value = artists.value.filter(artist => !artist.coverImageUrl);

          console.log('artistsWithoutCoverImg', artistsWithoutCoverImg);

          artistsWithoutProfileImg.value = artists.value.filter(artist => !artist.imageUrl);

          console.log('artistsWithoutProfileImg', artistsWithoutProfileImg);

          artistTimeStamp.value = artists.value.filter(artist => artistsUpdatedInLast24Hrs(artist.updated));

          console.log('artistTimeStamp', artistTimeStamp);

          artistsEnabled.value = artists.value.filter(artist => artistsEnabledInLastWeek(artist.enabled, artist.enabledTimestamp));

          console.log('artistsEnabled', artistsEnabled);
        }
      });

      return {
        artists,
        disabledArtists,
        artistsWithoutCoverImg,
        artistsWithoutProfileImg,
        percentageOfArtists,
        artistTimeStamp,
        artistsEnabled,
      };
    }
  };
</script>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Fontdiner+Swanky&display=swap');

    .has-brand-text {
        font-family: 'Fontdiner Swanky', cursive;
        letter-spacing: 3px;
    }

    $black: #020203;
    $white: #fff;
    $gray: #D6D7DC;

    $primary: #b9936c;
    $secondary: lime;

    $scheme-main: $black;
    $scheme-invert: $white;

    $text: $white;

    $dark: #14171A;
    $light: #e6e2d3;


    @import '~bulma';
</style>
