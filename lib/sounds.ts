export type SoundType = "click" | "dice_roll" | "combat_start" | "success" | "failure" | "victory" | "game_over" | "equip" | "potion";

export const SOUND_ASSETS: Record<SoundType, string> = {
  click: "https://cdn.pixabay.com/audio/2022/03/24/audio_c8c8a73467.mp3", // Short click
  dice_roll: "https://cdn.pixabay.com/audio/2022/03/10/audio_c3d4e40b8d.mp3", // Dice shake
  combat_start: "https://cdn.pixabay.com/audio/2022/03/15/audio_554f411145.mp3", // Sword schwing
  success: "https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3", // Chime
  failure: "https://cdn.pixabay.com/audio/2021/08/04/audio_0625c153e1.mp3", // Thud
  victory: "https://cdn.pixabay.com/audio/2021/08/09/audio_02c3350e78.mp3", // Fanfare
  game_over: "https://cdn.pixabay.com/audio/2021/08/04/audio_c6dd6e0c43.mp3", // Dark tone
  equip: "https://cdn.pixabay.com/audio/2022/03/24/audio_77b7721310.mp3", // Leather/metal sound
  potion: "https://cdn.pixabay.com/audio/2022/03/24/audio_8944276b47.mp3", // Liquid sound
};
