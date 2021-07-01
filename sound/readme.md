# UI sounds

`💾 ui-sounds-1st-gen.zip`

This is the first generation of UI sounds for the [cyber.page](https://cyber.page/). The first implementation has the task of testing sound effects for interactions with cyber.page and identifying usability problems, if any appears. it is also necessary to find out what capabilities we can have in terms of audio settings for the application.

#### Whats in:

* compressed audio files in 64 kbps mp3 format with 48KHz sample rate;
* demo video file that represents where this audio files should be implemented;	

#### Conditions of implementation:


action | img | audio file | playing | additional info
------|------|-------|----------|-------------------
Cyber.page loads || `page-load.mp3` | one-shot | plays when first page loading complete 
block lightening appears |![image](https://user-images.githubusercontent.com/83489928/123268019-3b010080-d530-11eb-8512-32551afe124c.png)| `connect-block-1.mp3` and `connect-block-2.mp3` | one shot | plays every time when block lightening appears (longest file for longest animation)
hover cyber brain icon | ![image](https://user-images.githubusercontent.com/83489928/123268163-5ec44680-d530-11eb-887a-91e2019e76e1.png) | `cyber-icon-hover-loop.mp3` | looped | plays every time when cursor hover cyber brain icon, cyclical
Bender icon | ![image](https://user-images.githubusercontent.com/83489928/123267323-75b66900-d52f-11eb-8cda-5fc21c6d0203.png)| `bender-what-you-gonna-do.mp3` | one shot | should play on hover just once
default object hover || `hover-click-1.mp3` | one shot | plays every time when cursor hover any object
main button hover (cyber for example) | ![image](https://user-images.githubusercontent.com/83489928/123268298-7f8c9c00-d530-11eb-9964-bc16060715e5.png) | `main-button-hover.mp3` | looped | plays every time when cursor hover main button
main button click (cyber for example) |![image](https://user-images.githubusercontent.com/83489928/123268298-7f8c9c00-d530-11eb-9964-bc16060715e5.png)| `main-button.mp3` | one shot | plays once when main button pressed
default click || `enter-click.mp3` | one shot | plays when clicking on any object
page load processing | ![image](https://user-images.githubusercontent.com/83489928/123268688-d98d6180-d530-11eb-8a1e-ef1d21b19250.png) | `data-processing-loop.mp3` | looped indefinite  | plays till page load animation ends
search or content result loading || `showing-result.mp3` | one shot | plays once when content start to appear
spark hover | ![image](https://user-images.githubusercontent.com/83489928/123269505-a4354380-d531-11eb-93ef-60cf250688c3.png) | `spark-rank-1(..6).mp3`  | looped | the file corresponding to the rank level of hovered spark is played
Inside content loading animation | ![image](https://user-images.githubusercontent.com/83489928/123270057-20c82200-d532-11eb-97a6-499fe2aa8f06.png) | `data-processing-2-loop.mp3` | looped indefinite  | plays till content loading animation ends


# Musical Typing

`💾 musical-typing-1-gen.zip`

This is the first demo sounds for typing. The idea is that different tonal sounds are assigned to each letter of the alphabet.  

#### Whats in:

* compressed audio files in 64 kbps mp3 format with 44.1KHz sample rate;

#### Conditions of implementation:

- the file name points to a letter;
- for numbers use file `num-default.mp3`;
- for tab button use `[].mp3`;
- when press and hold - use sound just once;
- there is no sound for:  
  - caps lock	
  - return/enter	
  - shift	
  - fn	
  - ctrl	
  - option	
  - cmd;
- for other symbols use `neutral-tone.mp3`;

